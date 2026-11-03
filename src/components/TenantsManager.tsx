import { useState } from 'react';
import { Tenant, Unit } from '../types';

interface Props {
  tenants: Tenant[];
  units: Unit[];
  onAdd: (tenant: Omit<Tenant, 'id' | 'propertyId'>) => void;
  onUpdate: (tenant: Tenant) => void;
  onDelete: (id: string) => void;
}

interface FormState {
  name: string;
  address: string;
  tenantNumber: string;
  iban: string;
  email: string;
  phone: string;
  moveInDate: string;
  moveOutDate: string;
  unitId: string;
  persons: number;
}

const emptyForm = (): FormState => ({
  name: '', address: '', tenantNumber: '', iban: '', email: '', phone: '',
  moveInDate: new Date().toISOString().split('T')[0], moveOutDate: '', unitId: '', persons: 1,
});

export default function TenantsManager({ tenants, units, onAdd, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);

  const [showHistory, setShowHistory] = useState<Tenant | null>(null);
  const [newHistoryDate, setNewHistoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [newHistoryPersons, setNewHistoryPersons] = useState(1);

  const [form, setForm] = useState<FormState>(emptyForm());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      address: form.address.trim(),
      tenantNumber: form.tenantNumber.trim(),
      iban: form.iban.trim(),
      email: form.email,
      phone: form.phone,
      moveInDate: form.moveInDate,
      moveOutDate: form.moveOutDate || null,
      unitId: form.unitId,
    };

    if (editing) {
      onUpdate({ ...editing, ...data });
      setEditing(null);
    } else {
      onAdd({
        ...data,
        personsHistory: [{ startDate: form.moveInDate, persons: form.persons }]
      });
    }
    setForm(emptyForm());
    setShowForm(false);
  };

  const startEdit = (t: Tenant) => {
    setEditing(t);
    const latestPersons = t.personsHistory && t.personsHistory.length > 0
      ? [...t.personsHistory].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0].persons
      : 1;

    setForm({
      name: t.name,
      address: t.address || '',
      tenantNumber: t.tenantNumber || '',
      iban: t.iban || '',
      email: t.email,
      phone: t.phone,
      moveInDate: t.moveInDate,
      moveOutDate: t.moveOutDate || '',
      unitId: t.unitId,
      persons: latestPersons,
    });
    setShowForm(true);
  };

  const handleAddHistory = () => {
    if (!showHistory) return;
    const newHistory = [...(showHistory.personsHistory || [])];
    newHistory.push({ startDate: newHistoryDate, persons: newHistoryPersons });
    newHistory.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    onUpdate({ ...showHistory, personsHistory: newHistory });
    setShowHistory({ ...showHistory, personsHistory: newHistory });
    setNewHistoryDate(new Date().toISOString().split('T')[0]);
    setNewHistoryPersons(1);
  };

  const handleDeleteHistory = (index: number) => {
    if (!showHistory) return;
    const newHistory = [...(showHistory.personsHistory || [])];
    newHistory.splice(index, 1);
    onUpdate({ ...showHistory, personsHistory: newHistory });
    setShowHistory({ ...showHistory, personsHistory: newHistory });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mieter</h2>
          <p className="text-gray-500 text-sm mt-1">{tenants.length} Mieter erfasst</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm()); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <i className="fas fa-plus"></i> Neuer Mieter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? 'Mieter bearbeiten' : 'Neuer Mieter'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Mieternummer (optional)</label><input type="text" value={form.tenantNumber} onChange={(e) => setForm({ ...form, tenantNumber: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="z.B. M-001" /></div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse (für Anschreiben)</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Straße, PLZ, Ort" />
            </div>

            <div><label className="block text-sm font-medium text-gray-700 mb-1">IBAN (für Guthaben-Rückzahlung)</label><input type="text" value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="DE..." /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" /></div>
            
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Einheit</label><select required value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2"><option value="">Wählen...</option>{units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" /></div>
            
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Einzug</label><input type="date" required value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Auszug (optional)</label><input type="date" value={form.moveOutDate} onChange={(e) => setForm({ ...form, moveOutDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" /></div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Personen im Haushalt</label>
              <input type="number" min="1" required disabled={!!editing} value={form.persons} onChange={(e) => setForm({ ...form, persons: parseInt(e.target.value) || 1 })} className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${editing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} />
              {editing && <p className="text-xs text-gray-500 mt-1"><i className="fas fa-info-circle"></i> Änderungen über den Button <strong>"X Pers."</strong> in der Liste vornehmen.</p>}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{editing ? 'Speichern' : 'Hinzufügen'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Abbrechen</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Mieternr.</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Einheit</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Zeitraum</th>
              <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Haushalt</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tenants.map((t) => {
              const latestPersons = t.personsHistory && t.personsHistory.length > 0
                ? [...t.personsHistory].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0].persons
                : 1;
              return (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{t.name}{t.address && <div className="text-xs text-gray-500">{t.address}</div>}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{t.tenantNumber || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{units.find(u => u.id === t.unitId)?.name || '—'}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{new Date(t.moveInDate).toLocaleDateString('de-DE')} – {t.moveOutDate ? new Date(t.moveOutDate).toLocaleDateString('de-DE') : 'laufend'}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => setShowHistory(t)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors" title="Haushaltsgröße verwalten">
                      <i className="fas fa-users text-gray-500 mr-1"></i> {latestPersons} Pers.
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => startEdit(t)} className="text-blue-600 hover:text-blue-800 p-1 mr-2"><i className="fas fa-edit"></i></button>
                    <button onClick={() => onDelete(t.id)} className="text-red-500 hover:text-red-700 p-1"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div><h3 className="text-xl font-bold text-gray-800">Haushaltsgröße</h3><p className="text-sm text-gray-500">{showHistory.name}</p></div>
              <button onClick={() => setShowHistory(null)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xl"></i></button>
            </div>
            <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg mb-4"><i className="fas fa-info-circle mr-2"></i>Wenn eine Person ein- oder auszieht, trage das Datum und die neue Gesamtanzahl ein.</div>
            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {showHistory.personsHistory?.map((h, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3"><span className="font-medium text-gray-800">Ab {new Date(h.startDate).toLocaleDateString('de-DE')}</span><span className="text-sm text-gray-600">{h.persons} Person(en)</span></div>
                  <button onClick={() => handleDeleteHistory(i)} className="text-red-400 hover:text-red-600"><i className="fas fa-trash"></i></button>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Neue Änderung hinzufügen</h4>
              <div className="flex gap-3 items-end">
                <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-1">Gültig ab</label><input type="date" value={newHistoryDate} onChange={(e) => setNewHistoryDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div className="w-24"><label className="block text-xs font-medium text-gray-600 mb-1">Personen</label><input type="number" min="1" value={newHistoryPersons} onChange={(e) => setNewHistoryPersons(parseInt(e.target.value) || 1)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <button onClick={handleAddHistory} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-sm">Hinzufügen</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
