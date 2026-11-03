import { useState, useMemo } from 'react';
import { Tenant, Unit, CostEntry, Prepayment, Property, getCostLabel } from '../types';
import { calculateDistribution, calculateLandlordShare, calculateCo2Split, getPrepaymentsForYear, getTotalCosts, formatCurrency, downloadWithPicker } from '../utils';
import html2pdf from 'html2pdf.js';

interface Props {
  property: Property;
  tenants: Tenant[];
  units: Unit[];
  costs: CostEntry[];
  prepayments: Prepayment[];
  onArchive: (year: number) => void;
  onUnarchive: (year: number) => void;
}

export default function ArchiveManager({ property, tenants, units, costs, prepayments, onArchive, onUnarchive }: Props) {
  const [previewYear, setPreviewYear] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const years = useMemo(() => {
    const ys = new Set(costs.map(c => new Date(c.date).getFullYear()));
    return Array.from(ys).sort().reverse();
  }, [costs]);

  const archivedYears = property.archivedYears || [];

  const generateArchiveData = (year: number) => {
    const yearCosts = costs.filter(c => new Date(c.date).getFullYear() === year);
    const distributions = calculateDistribution(yearCosts, tenants, units, property);
    const landlord = calculateLandlordShare(yearCosts, tenants, units, property);
    const co2 = calculateCo2Split(yearCosts, units);

    const tenantTotals: Record<string, { name: string; unit: string; categories: Record<string, number>; total: number; prepayments: number; balance: number; is35a: number }> = {};
    for (const d of distributions) {
      if (!tenantTotals[d.tenantId]) tenantTotals[d.tenantId] = { name: d.tenantName, unit: d.unitName, categories: {}, total: 0, prepayments: 0, balance: 0, is35a: 0 };
      tenantTotals[d.tenantId].categories[d.category] = (tenantTotals[d.tenantId].categories[d.category] || 0) + d.amount;
      tenantTotals[d.tenantId].total += d.amount;
    }
    for (const id of Object.keys(tenantTotals)) {
      tenantTotals[id].prepayments = getPrepaymentsForYear(id, year.toString(), prepayments);
      tenantTotals[id].balance = tenantTotals[id].prepayments - tenantTotals[id].total;
      const is35a = distributions.filter(d => d.tenantId === id && yearCosts.find(c => {
        const key = c.customCategoryLabel ? `custom:${c.customCategoryLabel}` : c.category;
        return key === d.category && c.is35a;
      }));
      tenantTotals[id].is35a = is35a.reduce((sum, d) => sum + d.amount, 0);
    }

    return { yearCosts, tenantTotals, landlord, co2, totalCosts: getTotalCosts(yearCosts) };
  };

  const handleExportPDF = async (year: number) => {
    setBusy(true);
    try {
      const element = document.getElementById(`archive-pdf-${year}`);
      if (!element) return;
      const opt = { margin: 10, image: { type: 'jpeg' as const, quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const } };
      const worker = html2pdf().from(element).set(opt);
      const blob = await worker.outputPdf('blob');
      await downloadWithPicker(blob as Blob, `Archiv_${property.name.replace(/[^a-z0-9]/gi, '_')}_${year}.pdf`, 'PDF-Dokument', 'application/pdf');
    } catch (err) {
      alert('Fehler beim PDF-Export: ' + (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handlePreview = (year: number) => setPreviewYear(year);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Archiv & Jahresabschluss</h2>
        <p className="text-gray-500 text-sm mt-1">Schließen Sie Jahre ab und bewahren Sie die Daten 10 Jahre für das Finanzamt auf.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Jahr</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {years.map(year => {
              const isArchived = archivedYears.includes(year);
              return (
                <tr key={year} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-800 text-lg">{year}</td>
                  <td className="px-6 py-4">
                    {isArchived ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><i className="fas fa-lock"></i> Archiviert</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><i className="fas fa-edit"></i> In Bearbeitung</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <button onClick={() => handlePreview(year)} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 text-sm font-medium"><i className="fas fa-eye mr-1"></i> Vorschau</button>
                      <button onClick={() => handleExportPDF(year)} disabled={busy} className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"><i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-file-pdf'} mr-1`}></i> PDF</button>
                      {isArchived ? (
                        <button onClick={() => onUnarchive(year)} className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 text-sm font-medium"><i className="fas fa-lock-open mr-1"></i> Öffnen</button>
                      ) : (
                        <button onClick={() => { if (confirm(`Jahr ${year} wirklich archivieren? Es kann später wieder geöffnet werden.`)) onArchive(year); }} className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm font-medium"><i className="fas fa-lock mr-1"></i> Archivieren</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {years.length === 0 && <div className="p-8 text-center text-gray-500">Keine Jahre mit Kosten gefunden.</div>}
      </div>

      {previewYear !== null && (() => {
        const data = generateArchiveData(previewYear);
        return (
          <div className="fixed inset-0 bg-black/80 z-50 flex flex-col p-4 md:p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-4 text-white sticky top-0 z-10">
              <h3 className="font-bold text-lg">Archiv-PDF Vorschau: {previewYear}</h3>
              <div className="flex gap-3">
                <button onClick={() => handleExportPDF(previewYear)} disabled={busy} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"><i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-download'}`}></i> PDF Herunterladen</button>
                <button onClick={() => setPreviewYear(null)} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"><i className="fas fa-times"></i> Schließen</button>
              </div>
            </div>

            <div className="bg-white mx-auto shadow-2xl w-full max-w-4xl text-black p-10" id={`archive-pdf-${previewYear}`}>
              <div className="text-center mb-12 border-b-4 border-blue-600 pb-8">
                <h1 className="text-3xl font-black text-gray-800 mb-2">Jahresabschluss {previewYear}</h1>
                <p className="text-lg text-gray-600 font-medium">{property.name}</p>
                <p className="text-sm text-gray-500">{property.address}</p>
                <p className="text-xs text-gray-400 mt-4">Erstellt am: {new Date().toLocaleDateString('de-DE')} · Steuernr: {property.taxId}</p>
              </div>

              <h2 className="text-xl font-bold mb-4 text-blue-800">1. Kostenaufstellung</h2>
              <table className="w-full text-sm mb-8 border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2 border">Datum</th>
                    <th className="text-left p-2 border">Bezeichnung</th>
                    <th className="text-right p-2 border">Betrag</th>
                    <th className="text-right p-2 border">Vermieteranteil</th>
                  </tr>
                </thead>
                <tbody>
                  {data.yearCosts.map(c => {
                    // Berechne den Mieteranteil für genau diese Kostenposition
                    const entryDistributions = calculateDistribution([c], tenants, units, property);
                    const tenantSum = entryDistributions.reduce((sum, d) => sum + d.amount, 0);
                    const landlordShareForRow = c.amount - tenantSum;

                    return (
                      <tr key={c.id}>
                        <td className="p-2 border">{new Date(c.date).toLocaleDateString('de-DE')}</td>
                        <td className="p-2 border">{getCostLabel(c.customCategoryLabel ? `custom:${c.customCategoryLabel}` : c.category)}</td>
                        <td className="p-2 border text-right">{formatCurrency(c.amount)}</td>
                        <td className="p-2 border text-right text-red-600">{landlordShareForRow > 0.01 ? formatCurrency(landlordShareForRow) : '-'}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={2} className="p-2 border text-right">Summe Gesamtkosten:</td>
                    <td className="p-2 border text-right">{formatCurrency(data.totalCosts)}</td>
                    <td className="p-2 border text-right text-red-600">{formatCurrency(data.landlord.total)}</td>
                  </tr>
                </tbody>
              </table>

              <h2 className="text-xl font-bold mb-4 text-blue-800">2. Zusammenfassung Vermieter</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="border p-3 rounded"><span className="block text-xs text-gray-500">Nicht umlagefähige Kosten</span><strong className="text-red-600">{formatCurrency(data.landlord.nonRecoverable)}</strong></div>
                <div className="border p-3 rounded"><span className="block text-xs text-gray-500">Leerstand / Flächenanteil</span><strong className="text-red-600">{formatCurrency(data.landlord.vacancy)}</strong></div>
                <div className="border p-3 rounded"><span className="block text-xs text-gray-500">CO₂-Vermieteranteil</span><strong className="text-red-600">{formatCurrency(data.landlord.co2)}</strong></div>
                <div className="border p-3 rounded bg-gray-50"><span className="block text-xs text-gray-700 font-bold">Summe Vermieteranteil</span><strong className="text-lg">{formatCurrency(data.landlord.total)}</strong></div>
              </div>

              <h2 className="text-xl font-bold mb-4 text-blue-800">3. Mieterabrechnungen</h2>
              {Object.entries(data.tenantTotals).map(([id, t]) => (
                <div key={id} className="mb-6 p-4 border rounded-lg">
                  <h3 className="font-bold text-lg mb-2">{t.name} ({t.unit})</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    {Object.entries(t.categories).map(([cat, amt]) => (
                      <div key={cat} className="flex justify-between border-b py-1"><span>{getCostLabel(cat)}</span><span>{formatCurrency(amt)}</span></div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t flex justify-between font-bold">
                    <span>Saldo (Nachzahlung/Guthaben):</span>
                    <span className={t.balance >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(Math.abs(t.balance))}</span>
                  </div>
                  {t.is35a > 0 && <div className="text-xs text-gray-500 mt-2">Enthält {formatCurrency(t.is35a)} Handwerkerleistungen (§35a EStG)</div>}
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
