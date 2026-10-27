import { useState } from 'react';
import { Unit } from '../types';
import { generateId } from '../utils';

interface Props {
  units: Unit[];
  onAdd: (unit: Unit) => void;
  onUpdate: (unit: Unit) => void;
  onDelete: (id: string) => void;
}

export default function UnitsManager({ units, onAdd, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<Unit | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', size: 0, rooms: 0, floor: 0 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      onUpdate({ ...editing, ...form });
      setEditing(null);
    } else {
      onAdd({ id: generateId(), ...form });
    }
    setForm({ name: '', size: 0, rooms: 0, floor: 0 });
    setShowForm(false);
  };

  const startEdit = (unit: Unit) => {
    setEditing(unit);
    setForm({ name: unit.name, size: unit.size, rooms: unit.rooms, floor: unit.floor });
    setShowForm(true);
  };

  const totalArea = units.reduce((sum, u) => sum + u.size, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Wohneinheiten</h2>
          <p className="text-gray-500 text-sm mt-1">
            {units.length} Einheiten · {totalArea.toFixed(0)} m² gesamt
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', size: 0, rooms: 0, floor: 0 }); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Neue Einheit
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editing ? 'Einheit bearbeiten' : 'Neue Wohneinheit'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bezeichnung</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. Whg. 1.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fläche (m²)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.size || ''}
                onChange={(e) => setForm({ ...form, size: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zimmer</label>
              <input
                type="number"
                required
                min="0"
                value={form.rooms || ''}
                onChange={(e) => setForm({ ...form, rooms: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etage</label>
              <input
                type="number"
                required
                value={form.floor || ''}
                onChange={(e) => setForm({ ...form, floor: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              {editing ? 'Speichern' : 'Hinzufügen'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
              Abbrechen
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit) => (
          <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{unit.name}</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><i className="fas fa-ruler-combined w-5 text-blue-500"></i> {unit.size} m²</p>
                  <p><i className="fas fa-door-open w-5 text-green-500"></i> {unit.rooms} Zimmer</p>
                  <p><i className="fas fa-building w-5 text-purple-500"></i> {unit.floor}. Etage</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(unit)} className="text-blue-600 hover:text-blue-800 p-1">
                  <i className="fas fa-edit"></i>
                </button>
                <button onClick={() => onDelete(unit.id)} className="text-red-500 hover:text-red-700 p-1">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {units.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <i className="fas fa-building text-4xl mb-3"></i>
          <p>Noch keine Wohneinheiten angelegt</p>
        </div>
      )}
    </div>
  );
}
