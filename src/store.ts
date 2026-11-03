import { useState, useCallback } from 'react';
import { Tenant, Unit, CostEntry, Settlement, Property, Prepayment } from './types';
import { generateId } from './utils';

const STORAGE_KEY = 'nebenkosten_data';

export interface AppData {
  properties: Property[];
  activePropertyId: string | null;
  tenants: Tenant[];
  units: Unit[];
  costs: CostEntry[];
  settlements: Settlement[];
  prepayments: Prepayment[];
}

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      let properties = parsed.properties || [];
      let activePropertyId = parsed.activePropertyId || null;
      if (parsed.property && !parsed.properties) {
        const oldProp = parsed.property;
        const newProp: Property = { ...oldProp, id: generateId(), archivedYears: [] };
        properties = [newProp];
        activePropertyId = newProp.id;
        if (parsed.units) parsed.units = parsed.units.map((u: any) => ({ ...u, propertyId: newProp.id }));
        if (parsed.tenants) parsed.tenants = parsed.tenants.map((t: any) => ({ ...t, propertyId: newProp.id }));
        if (parsed.costs) parsed.costs = parsed.costs.map((c: any) => ({ ...c, propertyId: newProp.id }));
        if (parsed.prepayments) parsed.prepayments = parsed.prepayments.map((p: any) => ({ ...p, propertyId: newProp.id }));
      }
      // Migration: Sicherstellen, dass archivedYears existiert
      properties = properties.map((p: any) => ({ ...p, archivedYears: p.archivedYears || [] }));
      
      return {
        properties, activePropertyId, tenants: parsed.tenants || [], units: parsed.units || [],
        costs: parsed.costs || [], settlements: parsed.settlements || [], prepayments: parsed.prepayments || [],
      };
    }
  } catch (e) { console.error('Fehler beim Laden:', e); }
  return { properties: [], activePropertyId: null, tenants: [], units: [], costs: [], settlements: [], prepayments: [] };
}

function saveData(data: AppData) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

export function useAppData() {
  const [data, setData] = useState<AppData>(loadData);

  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => { const next = updater(prev); saveData(next); return next; });
  }, []);

  const setActiveProperty = useCallback((id: string) => { updateData((prev) => ({ ...prev, activePropertyId: id })); }, [updateData]);

  const addProperty = useCallback((prop: Omit<Property, 'id'>) => {
    const newProp = { ...prop, id: generateId(), archivedYears: [] };
    updateData((prev) => ({ ...prev, properties: [...prev.properties, newProp], activePropertyId: prev.activePropertyId || newProp.id }));
    return newProp.id;
  }, [updateData]);

  const updateProperty = useCallback((prop: Property) => {
    updateData((prev) => ({ ...prev, properties: prev.properties.map(p => p.id === prop.id ? prop : p) }));
  }, [updateData]);

  const archiveYear = useCallback((propertyId: string, year: number) => {
    updateData((prev) => ({
      ...prev,
      properties: prev.properties.map(p => {
        if (p.id === propertyId) {
          const years = p.archivedYears || [];
          if (!years.includes(year)) years.push(year);
          return { ...p, archivedYears: years };
        }
        return p;
      })
    }));
  }, [updateData]);

  const unarchiveYear = useCallback((propertyId: string, year: number) => {
    updateData((prev) => ({
      ...prev,
      properties: prev.properties.map(p => {
        if (p.id === propertyId) {
          return { ...p, archivedYears: (p.archivedYears || []).filter(y => y !== year) };
        }
        return p;
      })
    }));
  }, [updateData]);

  const addUnit = useCallback((unit: Omit<Unit, 'id' | 'propertyId'>) => { if (!data.activePropertyId) return; updateData((prev) => ({ ...prev, units: [...prev.units, { ...unit, id: generateId(), propertyId: data.activePropertyId! }] })); }, [updateData, data.activePropertyId]);
  const updateUnit = useCallback((unit: Unit) => { updateData((prev) => ({ ...prev, units: prev.units.map((u) => (u.id === unit.id ? unit : u)) })); }, [updateData]);
  const deleteUnit = useCallback((id: string) => { updateData((prev) => ({ ...prev, units: prev.units.filter((u) => u.id !== id), tenants: prev.tenants.filter((t) => t.unitId !== id) })); }, [updateData]);

  const addTenant = useCallback((tenant: Omit<Tenant, 'id' | 'propertyId'>) => { if (!data.activePropertyId) return; updateData((prev) => ({ ...prev, tenants: [...prev.tenants, { ...tenant, id: generateId(), propertyId: data.activePropertyId! }] })); }, [updateData, data.activePropertyId]);
  const updateTenant = useCallback((tenant: Tenant) => { updateData((prev) => ({ ...prev, tenants: prev.tenants.map((t) => (t.id === tenant.id ? tenant : t)) })); }, [updateData]);
  const deleteTenant = useCallback((id: string) => { updateData((prev) => ({ ...prev, tenants: prev.tenants.filter((t) => t.id !== id), prepayments: prev.prepayments.filter((p) => p.tenantId !== id) })); }, [updateData]);

  const addCost = useCallback((cost: Omit<CostEntry, 'id' | 'propertyId'>) => { if (!data.activePropertyId) return; updateData((prev) => ({ ...prev, costs: [...prev.costs, { ...cost, id: generateId(), propertyId: data.activePropertyId! }] })); }, [updateData, data.activePropertyId]);
  const updateCost = useCallback((cost: CostEntry) => { updateData((prev) => ({ ...prev, costs: prev.costs.map((c) => (c.id === cost.id ? cost : c)) })); }, [updateData]);
  const deleteCost = useCallback((id: string) => { updateData((prev) => ({ ...prev, costs: prev.costs.filter((c) => c.id !== id) })); }, [updateData]);

  const addPrepayment = useCallback((prepayment: Omit<Prepayment, 'id' | 'propertyId'>) => { if (!data.activePropertyId) return; updateData((prev) => ({ ...prev, prepayments: [...prev.prepayments, { ...prepayment, id: generateId(), propertyId: data.activePropertyId! }] })); }, [updateData, data.activePropertyId]);
  const updatePrepayment = useCallback((prepayment: Prepayment) => { updateData((prev) => ({ ...prev, prepayments: prev.prepayments.map((p) => (p.id === prepayment.id ? prepayment : p)) })); }, [updateData]);
  const deletePrepayment = useCallback((id: string) => { updateData((prev) => ({ ...prev, prepayments: prev.prepayments.filter((p) => p.id !== id) })); }, [updateData]);

  const importData = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.properties || !Array.isArray(parsed.properties)) throw new Error('Ungültiges Dateiformat');
      const newData: AppData = {
        properties: parsed.properties.map((p: any) => ({ ...p, archivedYears: p.archivedYears || [] })),
        activePropertyId: parsed.activePropertyId || (parsed.properties[0]?.id || null),
        tenants: parsed.tenants || [], units: parsed.units || [], costs: parsed.costs || [],
        settlements: parsed.settlements || [], prepayments: parsed.prepayments || [],
      };
      setData(newData); saveData(newData); return true;
    } catch (e) { console.error(e); return false; }
  }, []);

  return {
    ...data, setActiveProperty, addProperty, updateProperty, archiveYear, unarchiveYear,
    addUnit, updateUnit, deleteUnit, addTenant, updateTenant, deleteTenant,
    addCost, updateCost, deleteCost, addPrepayment, updatePrepayment, deletePrepayment, importData,
  };
}
