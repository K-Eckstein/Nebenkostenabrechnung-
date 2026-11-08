export interface Property {
  id: string;
  name: string;
  address: string;
  owner: string;
  ownerAddress: string;
  phone: string;
  email: string;
  taxId: string;
  bank: string;
  bankName: string;
  archivedYears?: number[];
  totalArea?: number;
}

export interface Prepayment {
  id: string;
  propertyId: string;
  tenantId: string;
  monthlyAmount: number;
  startDate: string;
  endDate: string | null;
}

export interface PersonHistory {
  startDate: string;
  persons: number;
}

export interface Tenant {
  id: string;
  propertyId: string;
  name: string;
  address?: string;
  tenantNumber?: string;
  iban?: string;
  email: string;
  phone: string;
  moveInDate: string;
  moveOutDate: string | null;
  unitId: string;
  personsHistory: PersonHistory[];
}

export interface Unit {
  id: string;
  propertyId: string;
  name: string;
  size: number;
  rooms: number;
  floor: string;
  referenceValue?: number;
  heatingConsumption?: number;
}

export interface CostEntry {
  id: string;
  propertyId: string;
  category: CostCategory;
  customCategoryLabel?: string;
  description: string;
  amount: number;
  date: string;
  distributionKey: DistributionKey;
  co2Emissions?: number;
  co2PricePerTon?: number;
  vatRate?: number; // NEU: MwSt.-Satz in Prozent (Standard: 19)
  referenceTotal?: number;
  isRecoverable?: boolean;
  applyHeizkostenV?: boolean;
  heatingConsumptionPercent?: number;
  is35a?: boolean;
}

export type CostCategory =
  | 'heating' | 'water' | 'sewage' | 'garbage' | 'electricity_common' | 'insurance'
  | 'maintenance' | 'property_tax' | 'cleaning' | 'gardening' | 'elevator' | 'other';

export type DistributionKey = 'area' | 'persons' | 'consumption' | 'units' | 'reference' | 'reference_total';

export interface Settlement {
  id: string;
  year: number;
  periodStart: string;
  periodEnd: string;
  costs: CostEntry[];
  createdAt: string;
}

export interface CostDistribution {
  tenantId: string;
  tenantName: string;
  unitName: string;
  category: string;
  amount: number;
  share: number;
}

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  heating: 'Heizung', water: 'Wasser', sewage: 'Abwasser', garbage: 'Müllabfuhr',
  electricity_common: 'Allgemeinstrom', insurance: 'Versicherungen', maintenance: 'Instandhaltung',
  property_tax: 'Grundsteuer', cleaning: 'Reinigung', gardening: 'Gartenpflege',
  elevator: 'Aufzug', other: 'Sonstiges',
};

export const DISTRIBUTION_KEY_LABELS: Record<DistributionKey, string> = {
  area: 'Nach Wohnfläche (m²)', persons: 'Nach Personenzahl', consumption: 'Nach Verbrauch',
  units: 'Nach Wohneinheiten', reference: 'Nach Bezugsgröße (Mieter-Summe)',
  reference_total: 'Nach Gesamtbezugsgröße (mit Vermieteranteil)',
};

export function getCostLabel(key: string): string {
  if (key.startsWith('custom:')) return key.slice(7);
  return COST_CATEGORY_LABELS[key as CostCategory] || key;
}
