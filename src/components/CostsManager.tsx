import { useState } from 'react';
import { CostEntry, CostCategory, DistributionKey, COST_CATEGORY_LABELS, DISTRIBUTION_KEY_LABELS } from '../types';
import { generateId, formatCurrency } from '../utils';

interface Props {
  costs: CostEntry[];
  onAdd: (cost: CostEntry) => void;
  onUpdate: (cost: CostEntry) => void;
  onDelete: (id: string) => void;
}

export default function CostsManager({ costs, onAdd, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<CostEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [form, setForm] = useState({
    category: 'heating' as CostCategory,
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    distributionKey: 'area' as DistributionKey,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost: CostEntry = {
      id: editing?.id || generateId(),
      ...form,
    };
    if (editing) {
      onUpdate(cost);
      setEditing(null);
    } else {
      onAdd(cost);
    }
    setForm({
      category: 'heating',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      distributionKey: 'area',
    });
    setShowForm(false);
  };

  const startEdit = (cost: CostEntry) => {
    setEditing(cost);
    setForm({
      category: cost.category,
      description: cost.description,
      amount: cost.amount,
      date: cost.date,
      distributionKey: cost.distributionKey,
    });
    setShowForm(true);
  };

  const filteredCosts = filterCategory === 'all'
    ? costs
    : costs.filter((c) => c.category === filterCategory);

  const totalAmount = filteredCosts.reduce((sum, c) => sum + c.amount, 0);

  const sortedCosts = [...filteredCosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Betriebskosten</h2>
          <p className="text-gray-500 text-sm mt-1">
            {costs.length} Einträge · Gesamt: {formatCurrency(totalAmount)}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ category: 'heating', description: '', amount: 0, date: new Date().toISOString().split('T')[0], distributionKey: 'area' }); }}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Neue Kosten
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Alle
        </button>
        {(Object.entries(COST_CATEGORY_LABELS) as [CostCategory, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterCategory(key)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterCategory === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editing ? 'Kosten bearbeiten' : 'Neue Kosten erfassen'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as CostCategory })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {(Object.entries(COST_CATEGORY_LABELS) as [CostCategory, string][]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <input
                type="text"
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="z.B. Gasrechnung Q1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Betrag (€)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verteilerschlüssel</label>
              <select
                required
                value={form.distributionKey}
                onChange={(e) => setForm({ ...form, distributionKey: e.target.value as DistributionKey })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {(Object.entries(DISTRIBUTION_KEY_LABELS) as [DistributionKey, string][]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              {editing ? 'Speichern' : 'Hinzufügen'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {/* Kostenliste */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Datum</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Kategorie</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Beschreibung</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Verteiler</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Betrag</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedCosts.map((cost) => (
              <tr key={cost.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-600">{new Date(cost.date).toLocaleDateString('de-DE')}</td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {COST_CATEGORY_LABELS[cost.category]}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-800">{cost.description}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{DISTRIBUTION_KEY_LABELS[cost.distributionKey]}</td>
                <td className="px-6 py-4 text-right font-semibold text-gray-800">{formatCurrency(cost.amount)}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => startEdit(cost)} className="text-blue-600 hover:text-blue-800 p-1 mr-2">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => onDelete(cost.id)} className="text-red-500 hover:text-red-700 p-1">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {costs.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <i className="fas fa-receipt text-4xl mb-3"></i>
          <p>Noch keine Kosten erfasst</p>
        </div>
      )}
    </div>
  );
}
