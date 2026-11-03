import { useState } from 'react';
import { Unit } from '../types';
import { generateId } from '../utils';

interface Props {
  units: Unit[];
  onAdd: (unit: Omit<Unit, 'id' | 'propertyId'>) => void;
  onUpdate: (unit: Unit) => void;
  onDelete: (id: string) => void;
}

interface FormState {
  name: string;
  size: number;
  rooms: number;
  floor: string; // Text statt Number
  referenceValue: number | '';
  heatingConsumption: number | '';
}

const emptyForm = (): FormState => ({ name: '', size: 0, rooms: 0, floor: '', referenceValue: '', heatingConsumption: '' });

export default function UnitsManager({ units, onAdd, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<Unit | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      size: form.size,
      rooms: form.rooms,
      floor: form.floor,
      referenceValue: form.referenceValue !== '' && form.referenceValue > 0 ? form.referenceValue : undefined,
      heatingConsumption: form.heatingConsumption !== '' && form.heatingConsumption > 0 ? form.heatingConsumption : undefined,
    };
    if (editing) {
      onUpdate({ ...editing, ...data });
      setEditing(null);
    } else {
      onAdd(data);
    }
    setForm(emptyForm());
    setShowForm(false);
  };

  const startEdit = (unit: Unit) => {
    setEditing(unit);
    setForm({
      name: unit.name,
      size: unit.size,
      rooms: unit.rooms,
      floor: unit.floor || '',
      referenceValue: unit.referenceValue ?? '',
      heatingConsumption: unit.heatingConsumption ?? '',
    });
    setShowForm(true);
  };

  const totalArea = units.reduce((sum, u) => sum + u.size, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Wohneinheiten</h2>
          <p className="text-gray-500 text-sm mt-1">{units.length} Einheiten · {totalArea.toFixed(2)} m² gesamt</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm()); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"><i className="fas fa-plus"></i> Neue Einheit</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? 'Einheit bearbeiten' : 'Neue Wohneinheit'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bezeichnung</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="z.B. Whg. EG links" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fläche (m²)</label>
              <input type="number" required min="0" step="0.01" value={form.size || ''} onChange={(e) => setForm({ ...form, size: parseFloat(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zimmer</label>
              <input type="number" required min="0" value={form.rooms || ''} onChange={(e) => setForm({ ...form, rooms: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etage</label>
              <input type="text" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="z.B. EG, 1. OG, 2. OG" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heizungsverbrauch (kWh/Liter)</label>
              <input type="number" min="0" step="0.01" value={form.heatingConsumption} onChange={(e) => setForm({ ...form, heatingConsumption: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bezugsgröße (optional)</label>
              <input type="number" min="0" step="0.01" value={form.referenceValue} onChange={(e) => setForm({ ...form, referenceValue: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{editing ? 'Speichern' : 'Hinzufügen'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Abbrechen</button>
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
                  <p><i className="fas fa-building w-5 text-purple-500"></i> {unit.floor || '—'}</p>
                  {unit.heatingConsumption ? <p><i className="fas fa-fire w-5 text-orange-500"></i> {unit.heatingConsumption} kWh/l</p> : null}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(unit)} className="text-blue-600 hover:text-blue-800 p-1"><i className="fas fa-edit"></i></button>
                <button onClick={() => onDelete(unit.id)} className="text-red-500 hover:text-red-700 p-1"><i className="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
