import { useState, useMemo } from 'react';
import { Tenant, Unit, CostEntry, Prepayment } from '../types';
import { calculateDistribution, getPrepaymentsForYear, formatCurrency, downloadWithPicker } from '../utils';
import html2pdf from 'html2pdf.js';

interface Props {
  tenants: Tenant[];
  units: Unit[];
  costs: CostEntry[];
  prepayments: Prepayment[];
  property: any;
}

export default function LettersManager({ tenants, units, costs, prepayments, property }: Props) {
  const [yearFilter, setYearFilter] = useState<string>(() => {
    if (costs.length === 0) return new Date().getFullYear().toString();
    return Math.max(...costs.map((c) => new Date(c.date).getFullYear())).toString();
  });
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
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

  const tenantData = useMemo(() => {
    const result: Record<string, { name: string; unit: string; address: string; tenantNumber: string; iban: string; total: number; prepayments: number; balance: number; is35a: number }> = {};
    for (const d of distributions) {
      if (!result[d.tenantId]) result[d.tenantId] = { name: d.tenantName, unit: d.unitName, address: '', tenantNumber: '', iban: '', total: 0, prepayments: 0, balance: 0, is35a: 0 };
      result[d.tenantId].total += d.amount;
    }
    for (const t of tenants) {
      if (!result[t.id]) result[t.id] = { name: t.name, unit: units.find(u => u.id === t.unitId)?.name || '', address: '', tenantNumber: '', iban: '', total: 0, prepayments: 0, balance: 0, is35a: 0 };
      result[t.id].address = t.address || '';
      result[t.id].tenantNumber = t.tenantNumber || '';
      result[t.id].iban = t.iban || '';
      result[t.id].prepayments = getPrepaymentsForYear(t.id, yearFilter, prepayments);
      result[t.id].balance = result[t.id].prepayments - result[t.id].total;
      const is35a = distributions.filter(d => d.tenantId === t.id && filteredCosts.find(c => {
        const key = c.customCategoryLabel ? `custom:${c.customCategoryLabel}` : c.category;
        return key === d.category && c.is35a;
      }));
      result[t.id].is35a = is35a.reduce((sum, d) => sum + d.amount, 0);
    }
    return result;
  }, [distributions, tenants, prepayments, yearFilter, filteredCosts, units]);

  const selectedData = selectedTenantId ? tenantData[selectedTenantId] : null;

  const handlePrint = () => {
    if (!selectedTenantId) return;
    document.body.classList.add('print-letter-only');
    window.print();
    setTimeout(() => document.body.classList.remove('print-letter-only'), 1000);
  };

  const generatePdfBlob = async (): Promise<Blob | null> => {
    const element = document.getElementById('letter-preview');
    if (!element) return null;
    const opt = { margin: 15, image: { type: 'jpeg' as const, quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const } };
    const worker = html2pdf().from(element).set(opt);
    const blob = await worker.outputPdf('blob');
    return blob as Blob;
  };

  const handlePreviewPDF = async () => {
    if (!selectedTenantId) return;
    setBusy(true);
    try {
      const blob = await generatePdfBlob();
      if (blob) setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      alert('Fehler: ' + (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedTenantId) return;
    setBusy(true);
    try {
      const blob = await generatePdfBlob();
      if (blob) await downloadWithPicker(blob, `Anschreiben_${tenantData[selectedTenantId].name.replace(/[^a-z0-9]/gi, '_')}_${yearFilter}.pdf`, 'PDF-Dokument', 'application/pdf');
    } catch (err) {
      alert('Fehler: ' + (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          .print-letter-only > * { display: none !important; }
          .print-letter-only .letter-print-zone { display: block !important; position: static !important; }
          .print-letter-only .letter-print-zone * { display: block !important; }
          .print-letter-only .letter-print-zone .flex { display: flex !important; }
          .print-letter-only .letter-print-zone .grid { display: grid !important; }
        }
      `}</style>

      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mieteranschreiben</h2>
          <p className="text-gray-500 text-sm mt-1">Begleitschreiben zur Nebenkostenabrechnung</p>
        </div>
        <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setSelectedTenantId(null); }} className="border border-gray-300 rounded-lg px-3 py-2">
          {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-800"><i className="fas fa-users text-blue-600 mr-2"></i> Mieter</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {Object.entries(tenantData).map(([id, data]) => (
              <button
                key={id}
                onClick={() => setSelectedTenantId(id)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedTenantId === id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
              >
                <div className="font-medium text-gray-800">{data.name}</div>
                <div className="text-xs text-gray-500">{data.unit}</div>
                <div className={`text-xs mt-1 font-semibold ${data.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(data.balance))} {data.balance >= 0 ? 'Guthaben' : 'Nachzahlung'}
                </div>
              </button>
            ))}
            {Object.keys(tenantData).length === 0 && (
              <div className="p-6 text-center text-gray-400 text-sm">Keine Mieter für {yearFilter}</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {!selectedData ? (
            <div className="text-center py-16 text-gray-400">
              <i className="fas fa-envelope-open-text text-5xl mb-4"></i>
              <p>Wähle links einen Mieter aus, um das Anschreiben zu sehen</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={handlePreviewPDF} disabled={busy} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
                  <i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-eye'}`}></i> {busy ? 'Lädt...' : 'PDF-Vorschau'}
                </button>
                <button onClick={handleDownloadPDF} disabled={busy} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50">
                  <i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i> Speichern
                </button>
                <button onClick={handlePrint} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2">
                  <i className="fas fa-print"></i> Drucken
                </button>
              </div>

              <div id="letter-preview" className="letter-print-zone bg-white border border-gray-200 rounded-lg p-8 text-sm leading-relaxed text-gray-800" style={{ minHeight: '400px' }}>
                <div className="mb-8 pb-4 border-b-2 border-blue-600 flex justify-between items-start">
                  <div>
                    <strong className="block text-base">{property?.owner || 'Vermieter'}</strong>
                    <div className="text-xs text-gray-600">{property?.ownerAddress || ''}</div>
                  </div>
                  <div className="text-right">
                    <strong>{property?.name}</strong>
                    <div className="text-xs text-gray-600">{property?.address}</div>
                  </div>
                </div>
                <div className="mb-8">
                  {selectedData.tenantNumber && <div className="text-xs text-gray-500 mb-1">Mieternummer: {selectedData.tenantNumber}</div>}
                  <strong>{selectedData.name}</strong><br />
                  {selectedData.address ? (
                    <>{selectedData.address}<br /></>
                  ) : (
                    <>{selectedData.unit}<br />{property?.address}<br /></>
                  )}
                </div>
                <div className="text-right mb-8 text-xs text-gray-600">{new Date().toLocaleDateString('de-DE')}</div>
                <h2 className="font-bold text-base mb-4">Nebenkostenabrechnung {yearFilter}</h2>
                <p className="mb-3">Sehr geehrte(r) {selectedData.name.split(' ').pop()},</p>
                <p className="mb-3">anbei erhalten Sie die Nebenkostenabrechnung für das Jahr {yearFilter}.</p>
                <p className="mb-3">
                  Die Gesamtkosten belaufen sich auf <strong>{formatCurrency(selectedData.total)}</strong>. 
                  Ihre geleisteten Vorauszahlungen betragen <strong>{formatCurrency(selectedData.prepayments)}</strong>.
                </p>
                {selectedData.balance < 0 ? (
                  <p className="mb-3 p-3 bg-red-50 border border-red-200">
                    <strong>Zahlungsaufforderung:</strong> Bitte überweisen Sie den Nachzahlungsbetrag in Höhe von <strong>{formatCurrency(Math.abs(selectedData.balance))}</strong> bis zum {new Date(Date.now() + 30 * 86400000).toLocaleDateString('de-DE')} auf das unten genannte Konto.
                  </p>
                ) : (
                  <p className="mb-3 p-3 bg-green-50 border border-green-200">
                    <strong>Guthaben:</strong> Der Betrag in Höhe von <strong>{formatCurrency(selectedData.balance)}</strong> wird in den nächsten Tagen auf Ihr Konto {selectedData.iban ? `(IBAN: ${selectedData.iban})` : ''} überwiesen.
                  </p>
                )}
                {selectedData.is35a > 0 && (
                  <p className="mb-3">Die Bescheinigung für Handwerkerleistungen (§ 35a EStG) über <strong>{formatCurrency(selectedData.is35a)}</strong> liegt bei.</p>
                )}
                <p className="mb-8">Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
                <p>Mit freundlichen Grüßen</p>
                <div className="mt-8 border-t border-gray-400 w-48 pt-1 text-xs">{property?.owner || 'Vermieter'}</div>
                <div className="mt-8 text-xs text-gray-500 border-t border-gray-200 pt-2">
                  {property?.bankName} · IBAN: {property?.bank} · Steuernr: {property?.taxId}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex flex-col p-4 md:p-8">
          <div className="flex justify-between items-center mb-4 text-white">
            <h3 className="font-bold text-lg"><i className="fas fa-file-pdf mr-2 text-red-400"></i> PDF-Vorschau: Anschreiben</h3>
            <div className="flex gap-3">
              <button onClick={handleDownloadPDF} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                <i className="fas fa-download"></i> Jetzt speichern
              </button>
              <button onClick={closePreview} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                <i className="fas fa-times"></i> Schließen
              </button>
            </div>
          </div>
          <iframe src={previewUrl} className="flex-1 w-full bg-white rounded-lg shadow-2xl" title="PDF Vorschau" />
        </div>
      )}
    </div>
  );
}
