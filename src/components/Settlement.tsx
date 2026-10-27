import { useState, useMemo } from 'react';
import { Tenant, Unit, CostEntry, COST_CATEGORY_LABELS } from '../types';
import { calculateDistribution, formatCurrency, getTotalCosts, getCostsByCategory } from '../utils';

interface Props {
  tenants: Tenant[];
  units: Unit[];
  costs: CostEntry[];
}

export default function Settlement({ tenants, units, costs }: Props) {
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString());

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    costs.forEach((c) => years.add(new Date(c.date).getFullYear().toString()));
    if (years.size === 0) years.add(new Date().getFullYear().toString());
    return Array.from(years).sort().reverse();
  }, [costs]);

  const filteredCosts = useMemo(() => {
    return costs.filter((c) => new Date(c.date).getFullYear().toString() === yearFilter);
  }, [costs, yearFilter]);

  const distributions = useMemo(() => {
    return calculateDistribution(filteredCosts, tenants, units);
  }, [filteredCosts, tenants, units]);

  // Group by tenant
  const tenantTotals = useMemo(() => {
    const totals: Record<string, { name: string; unit: string; categories: Record<string, number>; total: number }> = {};
    for (const d of distributions) {
      if (!totals[d.tenantId]) {
        totals[d.tenantId] = { name: d.tenantName, unit: d.unitName, categories: {}, total: 0 };
      }
      totals[d.tenantId].categories[d.category] = (totals[d.tenantId].categories[d.category] || 0) + d.amount;
      totals[d.tenantId].total += d.amount;
    }
    return totals;
  }, [distributions]);

  const totalCosts = getTotalCosts(filteredCosts);
  const costsByCategory = getCostsByCategory(filteredCosts);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Nebenkostenabrechnung</h2>
          <p className="text-gray-500 text-sm mt-1">
            Abrechnungsjahr {yearFilter}
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={handlePrint}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-print"></i> Drucken
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="text-blue-100 text-sm">Gesamtkosten</div>
          <div className="text-2xl font-bold mt-1">{formatCurrency(totalCosts)}</div>
          <div className="text-blue-200 text-xs mt-1">{filteredCosts.length} Kostenpositionen</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div className="text-green-100 text-sm">Mieter</div>
          <div className="text-2xl font-bold mt-1">{Object.keys(tenantTotals).length}</div>
          <div className="text-green-200 text-xs mt-1">abzurechnende Parteien</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="text-purple-100 text-sm">Ø pro Mieter</div>
          <div className="text-2xl font-bold mt-1">
            {formatCurrency(Object.keys(tenantTotals).length > 0 ? totalCosts / Object.keys(tenantTotals).length : 0)}
          </div>
          <div className="text-purple-200 text-xs mt-1">durchschnittliche Belastung</div>
        </div>
      </div>

      {/* Kosten nach Kategorie */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Kosten nach Kategorie</h3>
        <div className="space-y-3">
          {Object.entries(costsByCategory).map(([category, amount]) => {
            const percentage = totalCosts > 0 ? (amount / totalCosts) * 100 : 0;
            return (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{COST_CATEGORY_LABELS[category as keyof typeof COST_CATEGORY_LABELS]}</span>
                  <span className="font-medium text-gray-800">{formatCurrency(amount)} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 rounded-full h-2 transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        {Object.keys(costsByCategory).length === 0 && (
          <p className="text-gray-400 text-center py-4">Keine Kosten für dieses Jahr erfasst</p>
        )}
      </div>

      {/* Mieterabrechnung */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" id="settlement-print">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Einzelabrechnung je Mieter</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Mieter</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Wohneinheit</th>
                {Object.keys(COST_CATEGORY_LABELS).filter((cat) => costsByCategory[cat]).map((cat) => (
                  <th key={cat} className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                    {COST_CATEGORY_LABELS[cat as keyof typeof COST_CATEGORY_LABELS]}
                  </th>
                ))}
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Gesamt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(tenantTotals).map(([tenantId, data]) => (
                <tr key={tenantId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{data.name}</td>
                  <td className="px-6 py-4 text-gray-600">{data.unit}</td>
                  {Object.keys(COST_CATEGORY_LABELS).filter((cat) => costsByCategory[cat]).map((cat) => (
                    <td key={cat} className="px-4 py-4 text-right text-gray-600">
                      {data.categories[cat] ? formatCurrency(data.categories[cat]) : '—'}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right font-bold text-gray-800">{formatCurrency(data.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td colSpan={2} className="px-6 py-4 font-bold text-gray-800">Summe</td>
                {Object.keys(COST_CATEGORY_LABELS).filter((cat) => costsByCategory[cat]).map((cat) => (
                  <td key={cat} className="px-4 py-4 text-right font-bold text-gray-800">
                    {formatCurrency(costsByCategory[cat] || 0)}
                  </td>
                ))}
                <td className="px-6 py-4 text-right font-bold text-blue-600 text-lg">{formatCurrency(totalCosts)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {Object.keys(tenantTotals).length === 0 && costs.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          Keine Zuordnung möglich. Bitte prüfen Sie, ob Mieter und Wohneinheiten korrekt angelegt sind.
        </div>
      )}

      {costs.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <i className="fas fa-file-invoice-dollar text-4xl mb-3"></i>
          <p>Keine Kosten erfasst. Legen Sie zuerst Betriebskosten an.</p>
        </div>
      )}
    </div>
  );
}
