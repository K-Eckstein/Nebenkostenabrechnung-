import { useState, useCallback } from 'react';
import { Tenant, Unit, CostEntry, Settlement } from './types';

const STORAGE_KEY = 'nebenkosten_data';

interface AppData {
  tenants: Tenant[];
  units: Unit[];
  costs: CostEntry[];
  settlements: Settlement[];
}

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Fehler beim Laden:', e);
  }
  return {
    tenants: [],
    units: [],
    costs: [],
    settlements: [],
  };
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useAppData() {
  const [data, setData] = useState<AppData>(loadData);

  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  // Units
  const addUnit = useCallback((unit: Unit) => {
    updateData((prev) => ({ ...prev, units: [...prev.units, unit] }));
  }, [updateData]);

  const updateUnit = useCallback((unit: Unit) => {
    updateData((prev) => ({
      ...prev,
      units: prev.units.map((u) => (u.id === unit.id ? unit : u)),
    }));
  }, [updateData]);

  const deleteUnit = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      units: prev.units.filter((u) => u.id !== id),
      tenants: prev.tenants.filter((t) => t.unitId !== id),
    }));
  }, [updateData]);

  // Tenants
  const addTenant = useCallback((tenant: Tenant) => {
    updateData((prev) => ({ ...prev, tenants: [...prev.tenants, tenant] }));
  }, [updateData]);

  const updateTenant = useCallback((tenant: Tenant) => {
    updateData((prev) => ({
      ...prev,
      tenants: prev.tenants.map((t) => (t.id === tenant.id ? tenant : t)),
    }));
  }, [updateData]);

  const deleteTenant = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      tenants: prev.tenants.filter((t) => t.id !== id),
    }));
  }, [updateData]);

  // Costs
  const addCost = useCallback((cost: CostEntry) => {
    updateData((prev) => ({ ...prev, costs: [...prev.costs, cost] }));
  }, [updateData]);

  const updateCost = useCallback((cost: CostEntry) => {
    updateData((prev) => ({
      ...prev,
      costs: prev.costs.map((c) => (c.id === cost.id ? cost : c)),
    }));
  }, [updateData]);

  const deleteCost = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      costs: prev.costs.filter((c) => c.id !== id),
    }));
  }, [updateData]);

  // Settlements
  const addSettlement = useCallback((settlement: Settlement) => {
    updateData((prev) => ({
      ...prev,
      settlements: [...prev.settlements, settlement],
    }));
  }, [updateData]);

  const deleteSettlement = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      settlements: prev.settlements.filter((s) => s.id !== id),
    }));
  }, [updateData]);

  return {
    ...data,
    addUnit,
    updateUnit,
    deleteUnit,
    addTenant,
    updateTenant,
    deleteTenant,
    addCost,
    updateCost,
    deleteCost,
    addSettlement,
    deleteSettlement,
  };
}
