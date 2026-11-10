import { useState, useMemo } from 'react';
import { Tenant, Unit, CostEntry, Prepayment, getCostLabel } from '../types';
import { calculateDistribution, calculateCo2Split, calculateLandlordShare, formatCurrency, getTotalCosts, getCostsByCategory, getPrepaymentsForYear, downloadWithPicker } from '../utils';
import html2pdf from 'html2pdf.js';

interface Props {
  tenants: Tenant[];
  units: Unit[];
  costs: CostEntry[];
  prepayments: Prepayment[];
  property: any;
}

export default function Settlement({ tenants, units, costs, prepayments, property }: Props) {
  const [yearFilter, setYearFilter] = useState<string>(() => {
    if (costs.length === 0) return new Date().getFullYear().toString();
    return Math.max(...costs.map((c) => new Date(c.date).getFullYear())).toString();
  });
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    costs.forEach((c) => years.add(new Date(c.date).getFullYear().toString()));
    if (years.size === 0) years.add(new Date().getFullYear().toString());
    return Array.from(years).sort().reverse();
  }, [costs]);

  const filteredCosts = useMemo(() => costs.filter((c) => new Date(c.date).getFullYear().toString() === yearFilter), [costs, yearFilter]);
  const distributions = useMemo(() => calculateDistribution(filteredCosts, tenants, units, property), [filteredCosts, tenants, units, property]);
  const co2Info = useMemo(() => calculateCo2Split(filteredCosts, units), [filteredCosts, units]);
  const landlordShare = useMemo(() => calculateLandlordShare(filteredCosts, tenants, units, property), [filteredCosts, tenants, units, property]);

  const tenantTotals = useMemo(() => {
    const totals: Record<string, { name: string; unit: string; categories: Record<string, number>; total: number; prepayments: number; balance: number; is35a: number }> = {};
    for (const d of distributions) {
      if (!totals[d.tenantId]) totals[d.tenantId] = { name: d.tenantName, unit: d.unitName, categories: {}, total: 0, prepayments: 0, balance: 0, is35a: 0 };
      totals[d.tenantId].categories[d.category] = (totals[d.tenantId].categories[d.category] || 0) + d.amount;
      totals[d.tenantId].total += d.amount;
    }
    for (const id of Object.keys(totals)) {
      const prep = getPrepaymentsForYear(id, yearFilter, prepayments);
      totals[id].prepayments = prep;
      totals[id].balance = prep - totals[id].total;
      const is35a = distributions.filter(d => d.tenantId === id && filteredCosts.find(c => {
        const key = c.customCategoryLabel ? `custom:${c.customCategoryLabel}` : c.category;
        return key === d.category && c.is35a;
      }));
      totals[id].is35a = is35a.reduce((sum, d) => sum + d.amount, 0);
    }
    return totals;
  }, [distributions, prepayments, yearFilter, filteredCosts]);

  const totalCosts = getTotalCosts(filteredCosts);
  const totalTenantCosts = Object.values(tenantTotals).reduce((sum, t) => sum + t.total, 0);
  const totalPrepayments = Object.values(tenantTotals).reduce((sum, t) => sum + t.prepayments, 0);
  const tenantCount = Object.keys(tenantTotals).length;

  const heatingCosts = filteredCosts.filter(c => c.category === 'heating' && c.applyHeizkostenV);
  const totalCons = units.reduce((sum, u) => sum + (u.heatingConsumption || 0), 0);
  const hasLandlordShare = landlordShare.total > 0;

  const handlePrint = (mode: 'all' | 'summary') => {
    document.body.classList.remove('print-only-summary');
    if (mode === 'summary') document.body.classList.add('print-only-summary');
    window.print();
    setTimeout(() => document.body.classList.remove('print-only-summary'), 1000);
  };

  const generatePdfBlob = async (): Promise<Blob | null> => {
    const element = document.getElementById('settlement-print');
    if (!element) { alert('Keine Abrechnung gefunden'); return null; }
    
    // NEU: pagebreak-Option hinzugefügt, damit Karten nicht zerrissen werden
    const opt = { 
      margin: 10, 
      image: { type: 'jpeg' as const, quality: 0.98 }, 
      html2canvas: { scale: 2, useCORS: true }, 
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    const worker = html2pdf().from(element).set(opt);
    const blob = await worker.outputPdf('blob');
    return blob as Blob;
  };

  const handlePreviewPDF = async () => {
    setBusy(true);
    try {
      const blob = await generatePdfBlob();
      if (blob) setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      alert('Fehler beim PDF-Export: ' + (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadPDF = async () => {
    setBusy(true);
    try {
      const blob = await generatePdfBlob();
      if (blob) await downloadWithPicker(blob, `Abrechnung_${yearFilter}.pdf`, 'PDF-Dokument', 'application/pdf');
    } catch (err) {
      alert('Fehler beim PDF-Export: ' + (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleExportCSV = async () => {
    let csv = `Mieter;Einheit;Kosten;Vorauszahlung;Saldo;Ergebnis\n`;
    Object.values(tenantTotals).forEach(t => {
      csv += `"${t.name}";"${t.unit}";${t.total.toFixed(2).replace('.', ',')};${t.prepayments.toFixed(2).replace('.', ',')};${t.balance.toFixed(2).replace('.', ',')};${t.balance >= 0 ? 'Guthaben' : 'Nachzahlung'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    await downloadWithPicker(blob, `Abrechnung_${yearFilter}.csv`, 'CSV-Datei', 'text/csv');
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print { 
          .print-only-summary .detail-card { display: none !important; } 
          .print-only-summary .admin-card { display: none !important; } 
        }
      `}</style>

      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div><h2 className="text-2xl font-bold text-gray-800">Abrechnung {yearFilter}</h2></div>
        <div className="flex flex-wrap gap-2">
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">{availableYears.map((y) => <option key={y} value={y}>{y}</option>)}</select>
          <button onClick={handleExportCSV} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"><i className="fas fa-file-csv"></i> CSV</button>
          <button onClick={handlePreviewPDF} disabled={busy} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
            <i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-eye'}`}></i> {busy ? 'Lädt...' : 'PDF-Vorschau'}
          </button>
          <button onClick={handleDownloadPDF} disabled={busy} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50">
            <i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i> Speichern
          </button>
          <button onClick={() => handlePrint('summary')} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"><i className="fas fa-print"></i> Salden</button>
        </div>
      </div>

      {/* NEU: ID hier nach oben verschoben, damit das PDF alles enthält */}
      <div id="settlement-print" className="space-y-6">
        
        <div className="summary-table bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50"><h3 className="text-lg font-semibold text-gray-800"><i className="fas fa-chart-pie text-blue-600 mr-2"></i> Salden-Übersicht</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-gray-200">
                <tr><th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Mieter</th><th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Kosten</th><th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Vorauszahlung</th><th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Saldo</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(tenantTotals).map(([id, data]) => (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{data.name}</td>
                    <td className="px-6 py-4 text-right">{formatCurrency(data.total)}</td>
                    <td className="px-6 py-4 text-right text-green-600">{formatCurrency(data.prepayments)}</td>
                    <td className={`px-6 py-4 text-right font-bold ${data.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(data.balance))} <span className="text-xs font-normal block">{data.balance >= 0 ? 'Guthaben' : 'Nachzahlung'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card space-y-4">
          {co2Info && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-leaf text-green-600"></i> CO₂-Kostenaufteilung</h3>
                  <p className="text-xs text-gray-500 mt-1">Gemäß CO2KostAufG (Stufenmodell für Wohngebäude)</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Stufe</div>
                  <div className="text-2xl font-bold text-gray-800">{co2Info.step} / 10</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-500">Gesamt-CO₂</div><div className="text-base font-semibold text-gray-800 mt-0.5">{co2Info.totalEmissions.toLocaleString('de-DE')} kg</div></div>
                <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-500">Beheizte Fläche</div><div className="text-base font-semibold text-gray-800 mt-0.5">{co2Info.heatedArea.toLocaleString('de-DE')} m²</div></div>
                <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-500">Spezifisch</div><div className="text-base font-semibold text-gray-800 mt-0.5">{co2Info.specificEmissions.toFixed(2)} kg/m²·a</div></div>
                <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-500">CO₂-Abgabe (Brutto)</div><div className="text-base font-semibold text-gray-800 mt-0.5">{formatCurrency(co2Info.tenantAmount + co2Info.landlordAmount)}</div></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-xs text-green-700 font-medium">Mieteranteil an der CO₂-Abgabe</div>
                  <div className="flex items-baseline gap-2 mt-1"><div className="text-2xl font-bold text-green-800">{formatCurrency(co2Info.tenantAmount)}</div><div className="text-sm text-green-700">({(co2Info.tenantShare * 100).toFixed(0)} %)</div></div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-xs text-orange-700 font-medium">Vermieteranteil an der CO₂-Abgabe</div>
                  <div className="flex items-baseline gap-2 mt-1"><div className="text-2xl font-bold text-orange-800">{formatCurrency(co2Info.landlordAmount)}</div><div className="text-sm text-orange-700">({(co2Info.landlordShare * 100).toFixed(0)} %)</div></div>
                </div>
              </div>
            </div>
          )}

          {hasLandlordShare && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4"><i className="fas fa-user-tie text-orange-600 mr-2"></i> Vermieteranteil gesamt</h3>
              <div className="space-y-2">
                {landlordShare.co2 > 0 && <div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm text-gray-700">CO₂-Anteil (nicht umlagefähig)</span><span className="font-semibold text-gray-800">{formatCurrency(landlordShare.co2)}</span></div>}
                {landlordShare.vacancy > 0 && <div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm text-gray-700">Leerstandskosten</span><span className="font-semibold text-gray-800">{formatCurrency(landlordShare.vacancy)}</span></div>}
                {landlordShare.nonRecoverable > 0 && <div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm text-gray-700">Nicht umlagefähige Kosten</span><span className="font-semibold text-gray-800">{formatCurrency(landlordShare.nonRecoverable)}</span></div>}
                <div className="flex justify-between items-center py-2 bg-orange-50 -mx-3 px-3 rounded-lg mt-2"><span className="text-sm font-semibold text-gray-800">Summe Vermieteranteil</span><span className="text-lg font-bold text-orange-700">{formatCurrency(landlordShare.total)}</span></div>
              </div>
            </div>
          )}

          {heatingCosts.length > 0 && totalCons > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4"><i className="fas fa-fire text-orange-500 mr-2"></i> HeizkostenV Vorschau</h3>
              <p className="text-sm text-gray-600 mb-3">Gesamtverbrauch: <strong>{totalCons} Einheiten</strong>. Aufteilung pro Heizungsposition:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {heatingCosts.map(c => (
                  <li key={c.id}>
                    <strong>{c.customCategoryLabel || c.description}:</strong> {c.heatingConsumptionPercent ?? 70} % Verbrauch / {100 - (c.heatingConsumptionPercent ?? 70)} % Fläche
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-8 print:pt-4">
          {Object.entries(tenantTotals).map(([tenantId, data]) => (
            <div key={tenantId} className="detail-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200"><h4 className="font-bold text-lg text-gray-800">{data.name}</h4><p className="text-sm text-gray-500">{data.unit}</p></div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
                  {Object.entries(data.categories).map(([cat, amount]) => (
                    <div key={cat} className="flex justify-between text-sm py-1 border-b border-gray-100">
                      <span className="text-gray-600">{getCostLabel(cat)}</span>
                      <span className="font-medium text-gray-800">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="font-medium text-gray-700">Gesamtkosten</span><span className="font-bold text-gray-800">{formatCurrency(data.total)}</span></div>
                  <div className="flex justify-between text-sm text-green-600"><span className="font-medium">Vorauszahlungen</span><span className="font-bold">- {formatCurrency(data.prepayments)}</span></div>
                  <div className={`flex justify-between items-center pt-3 mt-1 border-t border-gray-200 ${data.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}><span className="font-bold text-base">{data.balance >= 0 ? 'Guthaben' : 'Nachzahlung'}</span><span className="text-2xl font-black">{formatCurrency(Math.abs(data.balance))}</span></div>
                </div>
                {data.is35a > 0 && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-bold text-green-800 text-sm mb-1"><i className="fas fa-file-invoice-dollar mr-1"></i> Steuerbescheinigung (§ 35a EStG)</h5>
                    <p className="text-xs text-green-700">Handwerkerleistungen (Lohnanteil): <strong>{formatCurrency(data.is35a)}</strong></p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex flex-col p-4 md:p-8">
          <div className="flex justify-between items-center mb-4 text-white">
            <h3 className="font-bold text-lg"><i className="fas fa-file-pdf mr-2 text-red-400"></i> PDF-Vorschau: Abrechnung {yearFilter}</h3>
            <div className="flex gap-3">
              <button onClick={handleDownloadPDF} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"><i className="fas fa-download"></i> Jetzt speichern</button>
              <button onClick={closePreview} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"><i className="fas fa-times"></i> Schließen</button>
            </div>
          </div>
          <iframe src={previewUrl} className="flex-1 w-full bg-white rounded-lg shadow-2xl" title="PDF Vorschau" />
        </div>
      )}
    </div>
  );
}
