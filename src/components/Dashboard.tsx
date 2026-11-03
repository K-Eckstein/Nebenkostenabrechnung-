import { Tenant, Unit, CostEntry, COST_CATEGORY_LABELS } from '../types';
import { formatCurrency, getTotalCosts, getCostsByCategory, calculateDistribution } from '../utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  tenants: Tenant[];
  units: Unit[];
  costs: CostEntry[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export default function Dashboard({ tenants, units, costs }: Props) {
  const totalCosts = getTotalCosts(costs);
  const costsByCategory = getCostsByCategory(costs);
  const totalArea = units.reduce((sum, u) => sum + u.size, 0);

  const latestYear = costs.length > 0 ? Math.max(...costs.map((c) => new Date(c.date).getFullYear())) : new Date().getFullYear();
  const currentYearCosts = costs.filter((c) => new Date(c.date).getFullYear() === latestYear);
  const currentYearTotal = getTotalCosts(currentYearCosts);

  const distributions = calculateDistribution(currentYearCosts, tenants, units);
  const totalTenantCost = distributions.reduce((sum, d) => sum + d.amount, 0);
  const avgTenantCost = tenants.length > 0 ? totalTenantCost / tenants.length : 0;
  const avgPerSqm = totalArea > 0 ? currentYearTotal / totalArea : 0;

  const chartData = Object.entries(costsByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      name: COST_CATEGORY_LABELS[category as keyof typeof COST_CATEGORY_LABELS],
      value: amount,
    }));

  // Frist-Warnung
  const today = new Date();
  const pastYears = new Set(costs.map(c => new Date(c.date).getFullYear()).filter(y => y < today.getFullYear()));
  const warnings: { year: number; type: 'expired' | 'soon' }[] = [];
  pastYears.forEach(year => {
    const deadline = new Date(year + 1, 11, 31);
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) warnings.push({ year, type: 'expired' });
    else if (daysLeft < 90) warnings.push({ year, type: 'soon' });
  });

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-800">Dashboard</h2><p className="text-gray-500 text-sm mt-1">Übersicht Ihrer Nebenkostenabrechnung</p></div>

      {warnings.map(w => (
        <div key={w.year} className={`p-4 rounded-lg border flex items-start gap-3 ${w.type === 'expired' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
          <i className={`fas ${w.type === 'expired' ? 'fa-exclamation-circle text-red-600' : 'fa-clock text-yellow-600'} text-xl mt-0.5`}></i>
          <div><h3 className="font-bold">{w.type === 'expired' ? 'Abrechnungsfrist abgelaufen!' : 'Abrechnungsfrist läuft bald ab!'}</h3><p className="text-sm mt-1">Die Abrechnung für <strong>{w.year}</strong> muss bis zum 31.12.{w.year + 1} beim Mieter sein (§ 556 Abs. 3 BGB).</p></div>
        </div>
      ))}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center"><i className="fas fa-building text-blue-600 text-lg"></i></div><div><div className="text-2xl font-bold text-gray-800">{units.length}</div><div className="text-sm text-gray-500">Wohneinheiten</div></div></div></div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center"><i className="fas fa-users text-green-600 text-lg"></i></div><div><div className="text-2xl font-bold text-gray-800">{tenants.length}</div><div className="text-sm text-gray-500">Mieter</div></div></div></div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center"><i className="fas fa-receipt text-orange-600 text-lg"></i></div><div><div className="text-2xl font-bold text-gray-800">{formatCurrency(currentYearTotal)}</div><div className="text-sm text-gray-500">Kosten {latestYear}</div></div></div></div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center"><i className="fas fa-ruler-combined text-purple-600 text-lg"></i></div><div><div className="text-2xl font-bold text-gray-800">{totalArea.toFixed(0)} m²</div><div className="text-sm text-gray-500">Gesamtfläche</div></div></div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Kostenverteilung</h3>
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (<div className="text-center py-8 text-gray-400"><i className="fas fa-chart-pie text-3xl mb-2"></i><p>Noch keine Kosten erfasst</p></div>)}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Schnellübersicht</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><i className="fas fa-euro-sign text-blue-600"></i></div><div className="flex-1"><div className="text-sm text-gray-500">Gesamtkosten (alle Jahre)</div><div className="font-semibold text-gray-800">{formatCurrency(totalCosts)}</div></div></div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><i className="fas fa-home text-green-600"></i></div><div className="flex-1"><div className="text-sm text-gray-500">Ø Kosten pro m²</div><div className="font-semibold text-gray-800">{totalArea > 0 ? formatCurrency(avgPerSqm) : '—'} /m²</div></div></div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"><div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"><i className="fas fa-user text-orange-600"></i></div><div className="flex-1"><div className="text-sm text-gray-500">Ø Kosten pro Mieter</div><div className="font-semibold text-gray-800">{tenants.length > 0 ? formatCurrency(avgTenantCost) : '—'}</div></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
