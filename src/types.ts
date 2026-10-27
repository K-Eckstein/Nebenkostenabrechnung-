export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  moveInDate: string;
  moveOutDate: string | null;
  unitId: string;
}

export interface Unit {
  id: string;
  name: string;
  size: number; // in m²
  rooms: number;
  floor: number;
}

export interface CostEntry {
  id: string;
  category: CostCategory;
  description: string;
  amount: number;
  date: string;
  distributionKey: DistributionKey;
}

export type CostCategory =
  | 'heating'
  | 'water'
  | 'sewage'
  | 'garbage'
  | 'electricity_common'
  | 'insurance'
  | 'maintenance'
  | 'property_tax'
  | 'cleaning'
  | 'gardening'
  | 'elevator'
  | 'other';

export type DistributionKey = 'area' | 'persons' | 'consumption' | 'units';

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
  category: CostCategory;
  amount: number;
  share: number;
}

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  heating: 'Heizung',
  water: 'Wasser',
  sewage: 'Abwasser',
  garbage: 'Müllabfuhr',
  electricity_common: 'Allgemeinstrom',
  insurance: 'Versicherungen',
  maintenance: 'Instandhaltung',
  property_tax: 'Grundsteuer',
  cleaning: 'Reinigung',
  gardening: 'Gartenpflege',
  elevator: 'Aufzug',
  other: 'Sonstiges',
};

export const DISTRIBUTION_KEY_LABELS: Record<DistributionKey, string> = {
  area: 'Nach Wohnfläche (m²)',
  persons: 'Nach Personenzahl',
  consumption: 'Nach Verbrauch',
  units: 'Nach Wohneinheiten',
};
