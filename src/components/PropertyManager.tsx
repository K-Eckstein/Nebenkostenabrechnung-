import { useState } from 'react';
import { Property } from '../types';

interface Props {
  properties: Property[];
  activePropertyId: string | null;
  onSelect: (id: string) => void;
  onAdd: (property: Omit<Property, 'id'>) => void;
  onUpdate: (property: Property) => void;
}

export default function PropertyManager({ properties, activePropertyId, onSelect, onAdd, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);

  const emptyForm = {
    name: '', address: '', owner: '', ownerAddress: '', phone: '', email: '',
    taxId: '', bank: '', bankName: '', totalArea: '' as number | '',
  };
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name, address: form.address, owner: form.owner,
      ownerAddress: form.ownerAddress, phone: form.phone, email: form.email,
      taxId: form.taxId, bank: form.bank, bankName: form.bankName,
      totalArea: form.totalArea !== '' && form.totalArea > 0 ? form.totalArea : undefined,
    };
    if (editing) {
      onUpdate({ ...editing, ...data });
      setEditing(null);
    } else {
      onAdd(data);
    }
    setForm(emptyForm);
    setShowForm(false);
  };

  const startEdit = (p: Property) => {
    setEditing(p);
    setForm({
      name: p.name, address: p.address, owner: p.owner,
      ownerAddress: p.ownerAddress, phone: p.phone, email: p.email,
      taxId: p.taxId, bank: p.bank, bankName: p.bankName,
      totalArea: p.totalArea ?? '',
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Objekte & Vermieter</h2>
          <p className="text-gray-500 text-sm mt-1">Verwalten Sie Ihre Immobilien</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <i className="fas fa-plus"></i> Neues Objekt
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? 'Objekt bearbeiten' : 'Neues Objekt anlegen'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objektbezeichnung</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="z.B. Haus Meier" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objektadresse</label>
              <input type="text" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Gesamtfläche Gebäude (m²)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.totalArea}
                onChange={(e) => setForm({ ...form, totalArea: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="z.B. 114"
              />
              <p className="text-xs text-gray-500 mt-1">
                Gesamtfläche inkl. nicht vermieteter Flächen (Abstellräume, Heizraum etc.). 
                Bei Verteilerschlüssel „Nach Wohnfläche" trägt der Vermieter automatisch den Anteil 
                der nicht vermieteten Flächen. Ist der Wert leer, wird nur über die Summe der Einheiten verteilt.
              </p>
            </div>

            <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
              <h3 className="font-semibold text-gray-800 mb-3">Vermieter / Briefkopf</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name / Firma</label>
              <input type="text" required value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anschrift (Briefkopf)</label>
              <input type="text" required value={form.ownerAddress} onChange={(e) => setForm({ ...form, ownerAddress: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
              <input type="text" value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
              <input type="text" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Steuernummer</label>
              <input type="text" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">{editing ? 'Speichern' : 'Hinzufügen'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Abbrechen</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((p) => (
          <div key={p.id} className={`bg-white rounded-xl shadow-sm border-2 p-5 cursor-pointer transition-all ${p.id === activePropertyId ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'}`} onClick={() => onSelect(p.id)}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-gray-800">{p.name}</h3>
              <button onClick={(e) => { e.stopPropagation(); startEdit(p); }} className="text-gray-400 hover:text-blue-600 p-1"><i className="fas fa-edit"></i></button>
            </div>
            <p className="text-sm text-gray-600 mb-2">{p.address}</p>
            {p.totalArea && (
              <p className="text-xs text-gray-500 mb-1"><i className="fas fa-ruler-combined mr-1"></i> Gesamtfläche: {p.totalArea} m²</p>
            )}
            <p className="text-xs text-gray-500"><i className="fas fa-user-tie mr-1"></i> {p.owner}</p>
            {p.id === activePropertyId && <span className="inline-block mt-3 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">Aktiv</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
