import { Tenant, Unit, CostEntry, CostDistribution, DistributionKey, Prepayment, Property, getCostLabel } from './types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

// ─────────────────────────────────────────────────────────────────
// CO₂-Kostenaufteilung (Brutto-Berechnung inkl. MwSt.)
// ─────────────────────────────────────────────────────────────────
interface Co2Step { maxKgPerSqm: number; tenantShare: number; }

const CO2_STEPS: Co2Step[] = [
  { maxKgPerSqm: 12, tenantShare: 1.00 }, { maxKgPerSqm: 17, tenantShare: 0.90 },
  { maxKgPerSqm: 22, tenantShare: 0.80 }, { maxKgPerSqm: 27, tenantShare: 0.70 },
  { maxKgPerSqm: 32, tenantShare: 0.60 }, { maxKgPerSqm: 37, tenantShare: 0.50 },
  { maxKgPerSqm: 42, tenantShare: 0.40 }, { maxKgPerSqm: 47, tenantShare: 0.30 },
  { maxKgPerSqm: 52, tenantShare: 0.20 }, { maxKgPerSqm: Infinity, tenantShare: 0.05 },
];

export function getCo2Step(specificEmissions: number): number {
  for (let i = 0; i < CO2_STEPS.length; i++) if (specificEmissions < CO2_STEPS[i].maxKgPerSqm) return i + 1;
  return 10;
}

export function getCo2TenantShare(specificEmissions: number): number {
  for (const step of CO2_STEPS) if (specificEmissions < step.maxKgPerSqm) return step.tenantShare;
  return 0.05;
}

export interface Co2Info {
  totalEmissions: number; heatedArea: number; specificEmissions: number; step: number;
  tenantShare: number; landlordShare: number; tenantAmount: number; landlordAmount: number;
  baseHeatingAmount: number;
}

export function calculateCo2Split(costs: CostEntry[], units: Unit[]): Co2Info | null {
  const heatingCosts = costs.filter((c) => c.category === 'heating' && c.co2Emissions && c.co2Emissions > 0);
  if (heatingCosts.length === 0) return null;

  let totalEmissions = 0, totalCo2CostGross = 0, totalHeatingAmount = 0;
  for (const c of heatingCosts) {
    totalEmissions += c.co2Emissions || 0;
    totalHeatingAmount += c.amount;
    const vatRate = (c.vatRate ?? 19) / 100;
    const co2CostNet = ((c.co2Emissions || 0) / 1000) * (c.co2PricePerTon ?? 45);
    totalCo2CostGross += co2CostNet * (1 + vatRate);
  }

  const heatedArea = units.reduce((s, u) => s + u.size, 0);
  if (heatedArea <= 0 || totalEmissions <= 0) return null;

  const specificEmissions = totalEmissions / heatedArea;
  const step = getCo2Step(specificEmissions);
  const tenantShare = getCo2TenantShare(specificEmissions);
  const landlordShare = 1 - tenantShare;

  return {
    totalEmissions,
    heatedArea,
    specificEmissions,
    step,
    tenantShare,
    landlordShare,
    tenantAmount: totalCo2CostGross * tenantShare,
    landlordAmount: totalCo2CostGross * landlordShare,
    baseHeatingAmount: Math.max(0, totalHeatingAmount - totalCo2CostGross),
  };
}

// ─────────────────────────────────────────────────────────────────
// Pro-rata-temporis
// ─────────────────────────────────────────────────────────────────
function getDaysInYear(year: number): number {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
}

function getActiveTenantsWithDays(unitId: string, propertyId: string, year: number, tenants: Tenant[]): { tenant: Tenant; days: number }[] {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  const result: { tenant: Tenant; days: number }[] = [];
  for (const tenant of tenants) {
    if (tenant.unitId !== unitId) continue;
    if (tenant.propertyId !== propertyId) continue;
    const moveIn = new Date(tenant.moveInDate);
    const moveOut = tenant.moveOutDate ? new Date(tenant.moveOutDate) : null;
    const start = moveIn > yearStart ? moveIn : yearStart;
    const end = moveOut && moveOut < yearEnd ? moveOut : yearEnd;
    if (start > end) continue;
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (days > 0) result.push({ tenant, days });
  }
  return result;
}

function getPersonDaysForTenant(tenant: Tenant, year: number): number {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  const moveIn = new Date(tenant.moveInDate);
  const moveOut = tenant.moveOutDate ? new Date(tenant.moveOutDate) : null;
  const activeStart = moveIn > yearStart ? moveIn : yearStart;
  const activeEnd = moveOut && moveOut < yearEnd ? moveOut : yearEnd;
  if (activeStart > activeEnd) return 0;
  const totalActiveDays = Math.floor((activeEnd.getTime() - activeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  if (!tenant.personsHistory || tenant.personsHistory.length === 0) return totalActiveDays * 1;

  const history = [...tenant.personsHistory].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  let personDays = 0;
  let currentStart = new Date(Math.max(activeStart.getTime(), new Date(history[0].startDate).getTime()));
  let currentPersons = 1;
  if (new Date(history[0].startDate) <= activeStart) currentPersons = history[0].persons;

  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    const entryStart = new Date(entry.startDate);
    if (entryStart > activeEnd) break;
    if (entryStart > activeStart) {
      const days = Math.floor((entryStart.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 0) personDays += days * currentPersons;
      currentStart = entryStart;
      currentPersons = entry.persons;
    } else {
      currentPersons = entry.persons;
    }
  }
  if (currentStart <= activeEnd) {
    const days = Math.floor((activeEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (days > 0) personDays += days * currentPersons;
  }
  return personDays;
}

// ─────────────────────────────────────────────────────────────────
// Gewicht einer Einheit
// ─────────────────────────────────────────────────────────────────
function getUnitWeight(tenant: Tenant, unit: Unit, allUnits: Unit[], cost: CostEntry, year: number): number {
  if (cost.category === 'heating' && cost.applyHeizkostenV) {
    const consumptionPercent = (cost.heatingConsumptionPercent ?? 70) / 100;
    const areaPercent = 1 - consumptionPercent;
    const totalCons = allUnits.reduce((sum, u) => sum + (u.heatingConsumption || 0), 0);
    const totalArea = allUnits.reduce((sum, u) => sum + u.size, 0);
    const consShare = totalCons > 0 ? (unit.heatingConsumption || 0) / totalCons : 0;
    const areaShare = totalArea > 0 ? unit.size / totalArea : 0;
    return totalCons > 0 ? (consumptionPercent * consShare + areaPercent * areaShare) : areaShare;
  }
  switch (cost.distributionKey) {
    case 'area': return unit.size;
    case 'persons': return getPersonDaysForTenant(tenant, year);
    case 'units': return 1;
    case 'consumption': return unit.size;
    case 'reference':
    case 'reference_total': return unit.referenceValue || unit.size;
    default: return 1;
  }
}

function getTotalWeightForCost(tenants: Tenant[], units: Unit[], cost: CostEntry, year: number, property?: Property | null): number {
  const isHeizungsV = cost.category === 'heating' && cost.applyHeizkostenV;
  if (!isHeizungsV && cost.distributionKey === 'area' && property?.totalArea && property.totalArea > 0) {
    const unitSum = units.reduce((s, u) => s + u.size, 0);
    if (property.totalArea > unitSum) {
      return property.totalArea;
    }
  }
  return tenants.reduce((sum, t) => {
    const unit = units.find(u => u.id === t.unitId);
    if (!unit) return sum;
    return sum + getUnitWeight(t, unit, units, cost, year);
  }, 0);
}

// ─────────────────────────────────────────────────────────────────
// Vermieteranteile
// ─────────────────────────────────────────────────────────────────
export interface LandlordShare {
  co2: number;
  vacancy: number;
  nonRecoverable: number;
  total: number;
}

export function calculateLandlordShare(costs: CostEntry[], tenants: Tenant[], units: Unit[], property?: Property | null): LandlordShare {
  let co2 = 0, vacancy = 0, nonRecoverable = 0;
  const costsByYear: Record<number, CostEntry[]> = {};
  for (const cost of costs) {
    const year = new Date(cost.date).getFullYear();
    if (!costsByYear[year]) costsByYear[year] = [];
    costsByYear[year].push(cost);
  }

  for (const yearStr of Object.keys(costsByYear)) {
    const year = parseInt(yearStr);
    const yearCosts = costsByYear[year];
    const co2Info = calculateCo2Split(yearCosts, units);
    if (co2Info) co2 += co2Info.landlordAmount;
    const yearDays = getDaysInYear(year);
    const unitSum = units.reduce((s, u) => s + u.size, 0);

    for (const cost of yearCosts) {
      if (cost.isRecoverable === false) { nonRecoverable += cost.amount; continue; }

      let effectiveAmount = cost.amount;
      if (cost.category === 'heating' && co2Info && cost.co2Emissions) {
        const vatRate = (cost.vatRate ?? 19) / 100;
        const co2CostNet = (cost.co2Emissions / 1000) * (cost.co2PricePerTon ?? 45);
        const co2CostGross = co2CostNet * (1 + vatRate);
        effectiveAmount = cost.amount - co2CostGross;
      }

      const isHeizungsV = cost.category === 'heating' && cost.applyHeizkostenV;
      const useTotalArea = !isHeizungsV && cost.distributionKey === 'area' && property?.totalArea && property.totalArea > unitSum;

      const denominator = useTotalArea ? property!.totalArea! : getTotalWeightForCost(tenants, units, cost, year, property);
      if (denominator === 0) continue;

      if (useTotalArea) {
        vacancy += effectiveAmount * ((property!.totalArea! - unitSum) / property!.totalArea!);
      }

      for (const unit of units) {
        const active = getActiveTenantsWithDays(unit.id, cost.propertyId, year, tenants);
        const totalTenantDays = active.reduce((sum, a) => sum + a.days, 0);
        const vacantDays = Math.max(0, yearDays - totalTenantDays);

        if (vacantDays > 0) {
          const emptyTenant: Tenant = {
            id: 'empty', propertyId: cost.propertyId, name: '', email: '', phone: '',
            moveInDate: `${year}-01-01`, moveOutDate: `${year}-12-31`, unitId: '',
            personsHistory: [{ startDate: `${year}-01-01`, persons: 0 }],
          };
          const emptyWeight = getUnitWeight(emptyTenant, unit, units, cost, year) * (vacantDays / yearDays);
          vacancy += effectiveAmount * (emptyWeight / denominator);
        }
      }
    }
  }
  return { co2, vacancy, nonRecoverable, total: co2 + vacancy + nonRecoverable };
}

// ─────────────────────────────────────────────────────────────────
// Verteilung auf Mieter (Brutto-Korrektur)
// ─────────────────────────────────────────────────────────────────
export function calculateDistribution(costs: CostEntry[], tenants: Tenant[], units: Unit[], property?: Property | null): CostDistribution[] {
  const distributions: CostDistribution[] = [];
  const costsByYear: Record<number, CostEntry[]> = {};
  for (const cost of costs) {
    const year = new Date(cost.date).getFullYear();
    if (!costsByYear[year]) costsByYear[year] = [];
    costsByYear[year].push(cost);
  }

  for (const yearStr of Object.keys(costsByYear)) {
    const year = parseInt(yearStr);
    const yearCosts = costsByYear[year];
    const co2Info = calculateCo2Split(yearCosts, units);

    for (const cost of yearCosts) {
      if (cost.isRecoverable === false) continue;

      let effectiveAmount = cost.amount;
      if (cost.category === 'heating' && co2Info && cost.co2Emissions) {
        const vatRate = (cost.vatRate ?? 19) / 100;
        const co2CostNet = (cost.co2Emissions / 1000) * (cost.co2PricePerTon ?? 45);
        const co2CostGross = co2CostNet * (1 + vatRate);
        effectiveAmount = (cost.amount - co2CostGross) + (co2CostGross * co2Info.tenantShare);
      }

      const totalWeight = getTotalWeightForCost(tenants, units, cost, year, property);
      if (totalWeight === 0) continue;

      const displayKey = cost.customCategoryLabel ? `custom:${cost.customCategoryLabel}` : cost.category;

      for (const unit of units) {
        const activeTenants = getActiveTenantsWithDays(unit.id, cost.propertyId, year, tenants);
        for (const { tenant } of activeTenants) {
          const weight = getUnitWeight(tenant, unit, units, cost, year);
          const amount = effectiveAmount * (weight / totalWeight);
          distributions.push({
            tenantId: tenant.id,
            tenantName: tenant.name,
            unitName: unit.name || 'Unbekannt',
            category: displayKey,
            amount: Math.round(amount * 100) / 100,
            share: Math.round((weight / totalWeight) * 10000) / 100,
          });
        }
      }
    }
  }
  return distributions;
}

// ─────────────────────────────────────────────────────────────────
// Vorauszahlungen
// ─────────────────────────────────────────────────────────────────
export function getPrepaymentsForYear(tenantId: string, year: string, prepayments: Prepayment[]): number {
  const filtered = prepayments.filter((p) => p.tenantId === tenantId);
  if (filtered.length === 0) return 0;
  const yearStart = new Date(`${year}-01-01`);
  const yearEnd = new Date(`${year}-12-31`);
  let total = 0;
  for (const p of filtered) {
    const start = new Date(p.startDate);
    const end = p.endDate ? new Date(p.endDate) : yearEnd;
    const effectiveStart = start > yearStart ? start : yearStart;
    const effectiveEnd = end < yearEnd ? end : yearEnd;
    if (effectiveStart > effectiveEnd) continue;
    const months = (effectiveEnd.getFullYear() - effectiveStart.getFullYear()) * 12 + effectiveEnd.getMonth() - effectiveStart.getMonth() + 1;
    total += p.monthlyAmount * months;
  }
  return total;
}

export function getTotalCosts(costs: CostEntry[]): number {
  return costs.reduce((sum, c) => sum + c.amount, 0);
}

export function getCostsByCategory(costs: CostEntry[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const cost of costs) {
    const key = cost.customCategoryLabel ? `custom:${cost.customCategoryLabel}` : cost.category;
    result[key] = (result[key] || 0) + cost.amount;
  }
  return result;
}

export async function downloadWithPicker(blob: Blob, filename: string, description: string = 'Datei', mimeType: string = 'application/octet-stream'): Promise<void> {
  if ('showSaveFilePicker' in window) {
    try {
      const extension = '.' + filename.split('.').pop();
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{ description, accept: { [mimeType]: [extension] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.warn('Speichern-Dialog fehlgeschlagen:', err);
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getCostDisplayLabel(cost: CostEntry): string {
  return getCostLabel(cost.customCategoryLabel ? `custom:${cost.customCategoryLabel}` : cost.category);
}
