import { Tenant, Unit, CostEntry, CostDistribution, DistributionKey } from './types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function calculateDistribution(
  costs: CostEntry[],
  tenants: Tenant[],
  units: Unit[]
): CostDistribution[] {
  const distributions: CostDistribution[] = [];

  for (const cost of costs) {
    const activeTenants = tenants.filter((t) => {
      const costDate = new Date(cost.date);
      const moveIn = new Date(t.moveInDate);
      const moveOut = t.moveOutDate ? new Date(t.moveOutDate) : null;
      
      if (moveOut && costDate > moveOut) return false;
      if (costDate < moveIn) return false;
      return true;
    });

    if (activeTenants.length === 0) continue;

    const totalWeight = calculateTotalWeight(
      activeTenants,
      units,
      cost.distributionKey
    );

    if (totalWeight === 0) continue;

    for (const tenant of activeTenants) {
      const weight = calculateTenantWeight(tenant, units, cost.distributionKey);
      const share = weight / totalWeight;
      const amount = cost.amount * share;

      const unit = units.find((u) => u.id === tenant.unitId);

      distributions.push({
        tenantId: tenant.id,
        tenantName: tenant.name,
        unitName: unit?.name || 'Unbekannt',
        category: cost.category,
        amount: Math.round(amount * 100) / 100,
        share: Math.round(share * 10000) / 100,
      });
    }
  }

  return distributions;
}

function calculateTotalWeight(
  tenants: Tenant[],
  units: Unit[],
  key: DistributionKey
): number {
  return tenants.reduce((sum, t) => sum + calculateTenantWeight(t, units, key), 0);
}

function calculateTenantWeight(
  tenant: Tenant,
  units: Unit[],
  key: DistributionKey
): number {
  const unit = units.find((u) => u.id === tenant.unitId);
  if (!unit) return 0;

  switch (key) {
    case 'area':
      return unit.size;
    case 'persons':
      return 1; // Vereinfacht: pro Mieter 1
    case 'units':
      return 1;
    case 'consumption':
      return unit.size; // Fallback auf Fläche wenn kein Verbrauch erfasst
    default:
      return 1;
  }
}

export function getTotalCosts(costs: CostEntry[]): number {
  return costs.reduce((sum, c) => sum + c.amount, 0);
}

export function getCostsByCategory(costs: CostEntry[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const cost of costs) {
    result[cost.category] = (result[cost.category] || 0) + cost.amount;
  }
  return result;
}
