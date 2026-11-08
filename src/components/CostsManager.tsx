import { useState } from 'react';
import { CostEntry, CostCategory, DistributionKey, COST_CATEGORY_LABELS, DISTRIBUTION_KEY_LABELS, getCostLabel } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  costs: CostEntry[];
  onAdd: (cost: Omit<CostEntry, 'id' | 'propertyId'>) => void;
  onUpdate: (cost: CostEntry) => void;
  onDelete: (id: string) => void;
}

interface FormState {
  category: CostCategory;
  customCategoryLabel: string;
  description: string;
  amount: number;
  date: string;
  distributionKey: DistributionKey;
  co2Emissions: number | '';
  co2PricePerTon: number | '';
  vatRate: number; // NEU
  referenceTotal: number | '';
  isRecoverable: boolean;
  applyHeizkostenV: boolean;
  heatingConsumptionPercent: number;
  is35a: boolean;
}

const emptyForm = (): FormState => ({
  category: 'heating', customCategoryLabel: '', description: '', amount: 0, date: new Date().toISOString().split('T')[0],
  distributionKey: 'area', co2Emissions: '', co2PricePerTon: 45, vatRate: 19, referenceTotal: '',
  isRecoverable: true, applyHeizkostenV: true, heatingConsumptionPercent: 70, is35a: false,
});

export default function CostsManager({ costs, onAdd, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<CostEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [form, setForm] = useState<FormState>(emptyForm());

  const isHeating = form.category === 'heating';
  const showDistributionKey = !isHeating || !form.applyHeizkostenV;
  const needsReferenceTotal = form.distributionKey === 'reference_total';
  const percentWarning = form.heatingConsumptionPercent < 50 || form.heatingConsumptionPercent > 70;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = {
      id: editing?.id,
      category: form.category,
      customCategoryLabel: form.customCategoryLabel.trim() || undefined,
      description: form.description,
      amount: form.amount,
      date: form.date,
      distributionKey: form.distributionKey,
      co2Emissions: isHeating && form.co2Emissions !== '' && form.co2Emissions > 0 ? form.co2Emissions : undefined,
      co2PricePerTon: isHeating && form.co2PricePerTon !== '' && form.co2PricePerTon > 0 ? form.co2PricePerTon : undefined,
      vatRate: form.vatRate, // NEU
      referenceTotal: needsReferenceTotal && form.referenceTotal !== '' && form.referenceTotal > 0 ? form.referenceTotal : undefined,
      isRecoverable: form.isRecoverable,
      applyHeizkostenV: form.applyHeizkostenV,
      heatingConsumptionPercent: isHeating && form.applyHeizkostenV ? form.heatingConsumptionPercent : undefined,
      is35a: form.is35a,
    };
    if (editing) { onUpdate({ ...cost, id: editing.id, propertyId: editing.propertyId } as CostEntry); setEditing(null); }
    else { onAdd(cost as Omit<CostEntry, 'id' | 'propertyId'>); }
    setForm(emptyForm());
    setShowForm(false);
  };

  const startEdit = (cost: CostEntry) => {
    setEditing(cost);
    setForm({
      category: cost.category,
      customCategoryLabel: cost.customCategoryLabel ?? '',
      description: cost.description,
      amount: cost.amount,
      date: cost.date,
      distributionKey: cost.distributionKey,
      co2Emissions: cost.co2Emissions ?? '',
      co2PricePerTon: cost.co2PricePerTon ?? 45,
      vatRate: cost.vatRate ?? 19, // NEU
      referenceTotal: cost.referenceTotal ?? '',
      isRecoverable: cost.isRecoverable !== false,
      applyHeizkostenV: cost.applyHeizkostenV === true,
      heatingConsumptionPercent: cost.heatingConsumptionPercent ?? 70,
      is35a: cost.is35a || false,
    });
    setShowForm(true);
  };

  const handleCopyToNextYear = () => {
    if (costs.length === 0) return alert('Keine Kosten zum Kopieren vorhanden.');
    const latestYear = Math.max(...costs.map(c => new Date(c.date).getFullYear()));
    const nextYear = latestYear + 1;
    if (!window.confirm(`Alle Kosten aus ${latestYear} ins Jahr ${nextYear} kopieren?`)) return;
    costs.filter(c => new Date(c.date).getFullYear() === latestYear).forEach(c => {
      onAdd({
        category: c.category,
        customCategoryLabel: c.customCategoryLabel,
        description: c.description,
        amount: c.amount,
        date: c.date.replace(latestYear.toString(), nextYear.toString()),
        distributionKey: c.distributionKey,
        co2Emissions: undefined,
        co2PricePerTon: c.co2PricePerTon,
        vatRate: c.vatRate,
        referenceTotal: c.referenceTotal,
        isRecoverable: c.isRecoverable,
        applyHeizkostenV: c.applyHeizkostenV,
        heatingConsumptionPercent: c.heatingConsumptionPercent,
        is35a: c.is35a,
      });
    });
    alert(`✅ Kosten nach ${nextYear} kopiert (CO₂-Werte wurden zurückgesetzt).`);
  };

  const handleExportCSV = () => {
    let csv = 'Datum;Kategorie;Beschreibung;Betrag;MwSt;Umlagefähig;35a;Umlageschlüssel\n';
    costs.forEach(c => {
      const catLabel = getCostLabel(c.customCategoryLabel ? `custom:${c.customCategoryLabel}` : c.category);
      const key = c.category === 'heating' && c.applyHeizkostenV
        ? `${c.heatingConsumptionPercent ?? 70}/${100 - (c.heatingConsumptionPercent ?? 70)} Verbrauch/Fläche`
        : DISTRIBUTION_KEY_LABELS[c.distributionKey];
      csv += `${c.date};"${catLabel}";"${c.description}";${c.amount.toFixed(2).replace('.', ',')};${c.vatRate ?? 19}%;${c.isRecoverable !== false ? 'Ja' : 'Nein'};${c.is35a ? 'Ja' : 'Nein'};"${key}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Kosten_Export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const filteredCosts = filterCategory === 'all' ? costs : costs.filter((c) => c.category === filterCategory);
  const totalAmount = filteredCosts.reduce((sum, c) => sum + c.amount, 0);
  const sortedCosts = [...filteredCosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Betriebskosten</h2>
          <p className="text-gray-500 text-sm mt-1">{costs.length} Einträge · Gesamt: {formatCurrency(totalAmount)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportCSV} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"><i className="fas fa-file-csv"></i> CSV</button>
          <button onClick={handleCopyToNextYear} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"><i className="fas fa-copy"></i> Ins Folgejahr kopieren</button>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm()); }} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"><i className="fas fa-plus"></i> Neue Kosten</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterCategory('all')} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Alle</button>
        {(Object.entries(COST_CATEGORY_LABELS) as [CostCategory, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setFilterCategory(key)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterCategory === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{label}</button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? 'Kosten bearbeiten' : 'Neue Kosten erfassen'}</h3>

          <div className="mb-6 flex flex-wrap gap-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isRecoverable} onChange={(e) => setForm({ ...form, isRecoverable: e.target.checked })} className="w-5 h-5 text-orange-600" /><span className="text-sm font-medium text-gray-800">Auf Mieter umlagefähig</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is35a} onChange={(e) => setForm({ ...form, is35a: e.target.checked })} className="w-5 h-5 text-orange-600" /><span className="text-sm font-medium text-gray-800">Handwerker (§35a)</span></label>
            {isHeating && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.applyHeizkostenV} onChange={(e) => setForm({ ...form, applyHeizkostenV: e.target.checked })} className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-800">HeizkostenV anwenden</span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
              <select
                required
                value={form.category}
                onChange={(e) => {
                  const newCat = e.target.value as CostCategory;
                  setForm({
                    ...form,
                    category: newCat,
                    applyHeizkostenV: newCat === 'heating' ? form.applyHeizkostenV : false,
                    co2Emissions: newCat === 'heating' ? form.co2Emissions : '',
                  });
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {(Object.entries(COST_CATEGORY_LABELS) as [CostCategory, string][]).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Eigener Name <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="text"
                value={form.customCategoryLabel}
                onChange={(e) => setForm({ ...form, customCategoryLabel: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="z.B. Schornsteinfeger"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <input type="text" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="z.B. Rechnung 2024" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Betrag (€, Brutto)</label>
              <input type="number" required min="0" step="0.01" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
              <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>

            {/* NEU: MwSt.-Satz */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MwSt.-Satz</label>
              <select value={form.vatRate} onChange={(e) => setForm({ ...form, vatRate: parseInt(e.target.value) || 19 })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value={19}>19 % (Regelsteuersatz)</option>
                <option value={7}>7 % (Ermäßigt)</option>
                <option value={0}>0 % (Steuerfrei)</option>
              </select>
            </div>

            {isHeating && form.applyHeizkostenV && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verbrauchsanteil (%)</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="50" max="70" step="5" value={form.heatingConsumptionPercent} onChange={(e) => setForm({ ...form, heatingConsumptionPercent: parseInt(e.target.value) || 70 })} className="flex-1" />
                  <input type="number" min="0" max="100" step="1" value={form.heatingConsumptionPercent} onChange={(e) => setForm({ ...form, heatingConsumptionPercent: parseInt(e.target.value) || 0 })} className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-center" />
                  <span className="text-sm text-gray-600">%</span>
                </div>
                <p className={`text-xs mt-1 ${percentWarning ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                  {percentWarning ? '⚠ Außerhalb des Rahmens (50–70 %)' : `${form.heatingConsumptionPercent} % Verbrauch / ${100 - form.heatingConsumptionPercent} % Fläche`}
                </p>
              </div>
            )}

            {showDistributionKey && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Umlageschlüssel</label>
                <select required value={form.distributionKey} onChange={(e) => setForm({ ...form, distributionKey: e.target.value as DistributionKey })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {(Object.entries(DISTRIBUTION_KEY_LABELS) as [DistributionKey, string][]).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                </select>
              </div>
            )}

            {needsReferenceTotal && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gesamtbezugsgröße</label>
                <input type="number" min="0" step="0.01" value={form.referenceTotal} onChange={(e) => setForm({ ...form, referenceTotal: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="z.B. 114" />
              </div>
            )}

            {isHeating && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CO₂ (kg)</label>
                  <input type="number" min="0" step="0.01" value={form.co2Emissions} onChange={(e) => setForm({ ...form, co2Emissions: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="z.B. 4019.78" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CO₂-Preis (€/t, Netto)</label>
                  <input type="number" min="0" step="0.01" value={form.co2PricePerTon} onChange={(e) => setForm({ ...form, co2PricePerTon: e.target.value === '' ? '' : parseFloat(e.target.value) || 45 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  <p className="text-xs text-gray-500 mt-1">Der reine CO₂-Preis ohne MwSt. (wird automatisch versteuert).</p>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">{editing ? 'Speichern' : 'Hinzufügen'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">Abbrechen</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Datum</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Kategorie</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Beschreibung</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Umlageschlüssel</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Betrag</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedCosts.map((cost) => (
              <tr key={cost.id} className={`hover:bg-gray-50 ${cost.isRecoverable === false ? 'bg-red-50/30' : ''}`}>
                <td className="px-6 py-4 text-gray-600">{new Date(cost.date).toLocaleDateString('de-DE')}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${cost.isRecoverable === false ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                    {getCostLabel(cost.customCategoryLabel ? `custom:${cost.customCategoryLabel}` : cost.category)}
                  </span>
                  {cost.isRecoverable === false && <div className="text-[10px] text-red-600 font-bold mt-1">NICHT UMLAGEFÄHIG</div>}
                  {cost.is35a && <div className="text-[10px] text-green-600 font-bold mt-1">§35a HANDWERKER</div>}
                </td>
                <td className="px-6 py-4 text-gray-800">
                  {cost.description}
                  {cost.category === 'heating' && cost.co2Emissions ? (<div className="text-xs text-gray-500 mt-0.5">CO₂: {cost.co2Emissions.toLocaleString('de-DE')} kg</div>) : null}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {cost.category === 'heating' && cost.applyHeizkostenV ? (
                    <span className="text-blue-600 font-medium">
                      {cost.heatingConsumptionPercent ?? 70} % Verbrauch / {100 - (cost.heatingConsumptionPercent ?? 70)} % Fläche
                    </span>
                  ) : (
                    DISTRIBUTION_KEY_LABELS[cost.distributionKey] || cost.distributionKey
                  )}
                  {cost.distributionKey === 'reference_total' && cost.referenceTotal && (
                    <div className="text-xs text-gray-500 mt-0.5">Gesamt: {cost.referenceTotal}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-800">
                  {formatCurrency(cost.amount)}
                  <div className="text-xs text-gray-500 font-normal">{cost.vatRate ?? 19}% MwSt.</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => startEdit(cost)} className="text-blue-600 hover:text-blue-800 p-1 mr-2"><i className="fas fa-edit"></i></button>
                  <button onClick={() => onDelete(cost.id)} className="text-red-500 hover:text-red-700 p-1"><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
