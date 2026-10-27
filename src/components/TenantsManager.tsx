import { useState } from 'react';
import { Tenant, Unit } from '../types';
import { generateId } from '../utils';

interface Props {
  tenants: Tenant[];
  units: Unit[];
  onAdd: (tenant: Tenant) => void;
  onUpdate: (tenant: Tenant) => void;
  onDelete: (id: string) => void;
}

export default function TenantsManager({ tenants, units, onAdd, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    moveInDate: '',
    moveOutDate: '',
    unitId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant: Tenant = {
      id: editing?.id || generateId(),
      name: form.name,
      email: form.email,
      phone: form.phone,
      moveInDate: form.moveInDate,
      moveOutDate: form.moveOutDate || null,
      unitId: form.unitId,
    };
    if (editing) {
      onUpdate(tenant);
      setEditing(null);
    } else {
      onAdd(tenant);
    }
    setForm({ name: '', email: '', phone: '', moveInDate: '', moveOutDate: '', unitId: '' });
    setShowForm(false);
  };

  const startEdit = (tenant: Tenant) => {
    setEditing(tenant);
    setForm({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      moveInDate: tenant.moveInDate,
      moveOutDate: tenant.moveOutDate || '',
      unitId: tenant.unitId,
    });
    setShowForm(true);
  };

  const getUnitName = (unitId: string) => units.find((u) => u.id === unitId)?.name || 'Nicht zugewiesen';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mieter</h2>
          <p className="text-gray-500 text-sm mt-1">
            {tenants.length} aktive Mieter
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', email: '', phone: '', moveInDate: '', moveOutDate: '', unitId: '' }); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          disabled={units.length === 0}
        >
          <i className="fas fa-plus"></i> Neuer Mieter
        </button>
      </div>

      {units.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          Bitte legen Sie zuerst mindestens eine Wohneinheit an.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editing ? 'Mieter bearbeiten' : 'Neuer Mieter'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Max Mustermann"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="max@example.de"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0123 456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wohneinheit</label>
              <select
                required
                value={form.unitId}
                onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Bitte wählen...</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.size} m²)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Einzugsdatum</label>
              <input
                type="date"
                required
                value={form.moveInDate}
                onChange={(e) => setForm({ ...form, moveInDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auszugsdatum (optional)</label>
              <input
                type="date"
                value={form.moveOutDate}
                onChange={(e) => setForm({ ...form, moveOutDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              {editing ? 'Speichern' : 'Hinzufügen'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
              Abbrechen
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Wohneinheit</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Einzug</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Kontakt</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-800">{tenant.name}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{getUnitName(tenant.unitId)}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(tenant.moveInDate).toLocaleDateString('de-DE')}
                  {tenant.moveOutDate && (
                    <span className="text-red-500 ml-2">
                      (ausgez. {new Date(tenant.moveOutDate).toLocaleDateString('de-DE')})
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {tenant.email && <div><i className="fas fa-envelope mr-1"></i>{tenant.email}</div>}
                  {tenant.phone && <div><i className="fas fa-phone mr-1"></i>{tenant.phone}</div>}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => startEdit(tenant)} className="text-blue-600 hover:text-blue-800 p-1 mr-2">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => onDelete(tenant.id)} className="text-red-500 hover:text-red-700 p-1">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tenants.length === 0 && units.length > 0 && (
        <div className="text-center py-12 text-gray-400">
          <i className="fas fa-users text-4xl mb-3"></i>
          <p>Noch keine Mieter angelegt</p>
        </div>
      )}
    </div>
  );
}
