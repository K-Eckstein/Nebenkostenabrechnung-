import { useState } from 'react';
import { Prepayment, Tenant, Unit } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  prepayments: Prepayment[];
  tenants: Tenant[];
  units: Unit[];
  onAdd: (prepayment: Omit<Prepayment, 'id' | 'propertyId'>) => void;
  onUpdate: (prepayment: Prepayment) => void;
  onDelete: (id: string) => void;
}

export default function PrepaymentsManager({ prepayments, tenants, units, onAdd, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Prepayment | null>(null);
  
  const [form, setForm] = useState({
    tenantId: '',
    monthlyAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      tenantId: form.tenantId,
      monthlyAmount: form.monthlyAmount,
      startDate: form.startDate,
      endDate: form.endDate || null,
    };

    if (editing) {
      onUpdate({ ...editing, ...data });
      setEditing(null);
    } else {
      onAdd(data);
    }
    
    setForm({ tenantId: '', monthlyAmount: 0, startDate: new Date().toISOString().split('T')[0], endDate: '' });
    setShowForm(false);
  };

  const startEdit = (p: Prepayment) => {
    setEditing(p);
    setForm({
      tenantId: p.tenantId,
      monthlyAmount: p.monthlyAmount,
      startDate: p.startDate,
      endDate: p.endDate || '',
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Vorauszahlungen</h2>
          <p className="text-gray-500 text-sm mt-1">Monatliche Zahlungen der Mieter</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Neue Vorauszahlung
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? 'Bearbeiten' : 'Neue Vorauszahlung'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mieter</label>
              <select required value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Wählen...</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({units.find(u => u.id === t.unitId)?.name || '?'})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monatlich (€)</label>
              <input type="number" required min="0" step="0.01" value={form.monthlyAmount || ''} onChange={(e) => setForm({ ...form, monthlyAmount: parseFloat(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
              <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enddatum (optional)</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">{editing ? 'Speichern' : 'Hinzufügen'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Abbrechen</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Mieter</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Monatlich</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Jährlich</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Zeitraum</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {prepayments.map((p) => {
              const t = tenants.find(x => x.id === p.tenantId);
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{t?.name || 'Unbekannt'}</td>
                  <td className="px-6 py-4 text-right font-semibold text-green-600">{formatCurrency(p.monthlyAmount)}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(p.monthlyAmount * 12)}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {new Date(p.startDate).toLocaleDateString('de-DE')} – {p.endDate ? new Date(p.endDate).toLocaleDateString('de-DE') : 'laufend'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => startEdit(p)} className="text-blue-600 hover:text-blue-800 p-1 mr-2"><i className="fas fa-edit"></i></button>
                    <button onClick={() => onDelete(p.id)} className="text-red-500 hover:text-red-700 p-1"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {prepayments.length === 0 && <div className="text-center py-12 text-gray-400"><i className="fas fa-money-bill-wave text-4xl mb-3"></i><p>Noch keine Vorauszahlungen</p></div>}
      </div>
    </div>
  );
}
