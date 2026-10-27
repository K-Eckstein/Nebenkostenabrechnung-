import { Tenant, Unit, CostEntry } from '../types';
import { formatCurrency, getTotalCosts, getCostsByCategory } from '../utils';
import { COST_CATEGORY_LABELS } from '../types';

interface Props {
  tenants: Tenant[];
  units: Unit[];
  costs: CostEntry[];
}

export default function Dashboard({ tenants, units, costs }: Props) {
  const totalCosts = getTotalCosts(costs);
  const costsByCategory = getCostsByCategory(costs);
  const currentYear = new Date().getFullYear();
  const currentYearCosts = costs.filter((c) => new Date(c.date).getFullYear() === currentYear);
  const currentYearTotal = getTotalCosts(currentYearCosts);
  const totalArea = units.reduce((sum, u) => sum + u.size, 0);

  const topCategories = Object.entries(costsByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Übersicht Ihrer Nebenkostenabrechnung</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <i className="fas fa-building text-blue-600 text-lg"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{units.length}</div>
              <div className="text-sm text-gray-500">Wohneinheiten</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <i className="fas fa-users text-green-600 text-lg"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{tenants.length}</div>
              <div className="text-sm text-gray-500">Mieter</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <i className="fas fa-receipt text-orange-600 text-lg"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{formatCurrency(currentYearTotal)}</div>
              <div className="text-sm text-gray-500">Kosten {currentYear}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <i className="fas fa-ruler-combined text-purple-600 text-lg"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{totalArea.toFixed(0)} m²</div>
              <div className="text-sm text-gray-500">Gesamtfläche</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Kostenkategorien */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Kostenkategorien</h3>
          {topCategories.length > 0 ? (
            <div className="space-y-4">
              {topCategories.map(([category, amount]) => {
                const percentage = totalCosts > 0 ? (amount / totalCosts) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{COST_CATEGORY_LABELS[category as keyof typeof COST_CATEGORY_LABELS]}</span>
                      <span className="text-gray-500">{formatCurrency(amount)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-full h-3 transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{percentage.toFixed(1)}% der Gesamtkosten</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <i className="fas fa-chart-bar text-3xl mb-2"></i>
              <p>Noch keine Kosten erfasst</p>
            </div>
          )}
        </div>

        {/* Schnellübersicht */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Schnellübersicht</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="fas fa-euro-sign text-blue-600"></i>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500">Gesamtkosten (alle Jahre)</div>
                <div className="font-semibold text-gray-800">{formatCurrency(totalCosts)}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <i className="fas fa-home text-green-600"></i>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500">Ø Kosten pro m²</div>
                <div className="font-semibold text-gray-800">
                  {totalArea > 0 ? formatCurrency(totalCosts / totalArea) : '—'} /m²
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <i className="fas fa-user text-orange-600"></i>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500">Ø Kosten pro Mieter</div>
                <div className="font-semibold text-gray-800">
                  {tenants.length > 0 ? formatCurrency(totalCosts / tenants.length) : '—'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <i className="fas fa-file-alt text-purple-600"></i>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500">Kostenpositionen</div>
                <div className="font-semibold text-gray-800">{costs.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Letzte Kosten */}
      {costs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Letzte Kostenpositionen</h3>
          <div className="space-y-2">
            {[...costs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((cost) => (
              <div key={cost.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <i className="fas fa-receipt text-blue-500 text-sm"></i>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{cost.description}</div>
                    <div className="text-xs text-gray-500">
                      {COST_CATEGORY_LABELS[cost.category]} · {new Date(cost.date).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
                <div className="font-semibold text-gray-800">{formatCurrency(cost.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started */}
      {units.length === 0 && tenants.length === 0 && costs.length === 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-rocket text-blue-600 text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Willkommen!</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Starten Sie mit der Erstellung Ihrer Nebenkostenabrechnung. Folgen Sie diesen Schritten:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">1</div>
              <div className="text-sm font-medium text-gray-800">Wohneinheiten anlegen</div>
              <div className="text-xs text-gray-500 mt-1">Erfassen Sie Ihre Wohnungen/Gewerbeeinheiten</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">2</div>
              <div className="text-sm font-medium text-gray-800">Mieter zuordnen</div>
              <div className="text-xs text-gray-500 mt-1">Tragen Sie Ihre Mieter mit Einzugsdatum ein</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">3</div>
              <div className="text-sm font-medium text-gray-800">Kosten erfassen</div>
              <div className="text-xs text-gray-500 mt-1">Erfassen Sie alle Betriebskosten und erstellen Sie die Abrechnung</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
