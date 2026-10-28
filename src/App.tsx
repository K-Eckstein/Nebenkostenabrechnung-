import { useState } from 'react';

export default function App() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    const a = document.createElement('a');
    a.href = './nebenkosten.html';
    a.download = 'Nebenkostenabrechnung.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <i className="fas fa-calculator text-white text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Nebenkostenabrechnung</h1>
          <p className="text-gray-500 text-lg">Rechtskonforme Betriebskostenverwaltung nach deutschem Mietrecht</p>
        </div>

        {/* Download Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-download text-green-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Standalone-Version herunterladen</h2>
              <p className="text-gray-500 text-sm">
                Einzelne HTML-Datei – per Doppelklick im Browser öffnen. Keine Installation, kein Server nötig.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Wird heruntergeladen...
              </>
            ) : (
              <>
                <i className="fas fa-file-download text-xl"></i>
                Nebenkostenabrechnung.html herunterladen
              </>
            )}
          </button>

          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-800 mb-2">
              <i className="fas fa-info-circle mr-2"></i>
              <strong>Tipp:</strong> Nach dem Download die Datei einfach doppelklicken – sie funktioniert komplett offline!
            </p>
            <p className="text-xs text-blue-600">
              <i className="fas fa-link mr-1"></i>
              Alternativ: <a href="./nebenkosten.html" target="_blank" className="underline font-medium">Direkt zur Standalone-Version</a>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-star text-yellow-500"></i>
            Funktionen (Rechtskonform nach deutschem Mietrecht)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <i className="fas fa-home text-blue-600 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-gray-800">Objekt-Stammdaten</div>
                <div className="text-xs text-gray-500">Immobilie, Eigentümer, Adresse, Grundbuch</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <i className="fas fa-building text-indigo-600 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-gray-800">Wohneinheiten</div>
                <div className="text-xs text-gray-500">Fläche, Zimmer, Etage, Heizungstyp</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <i className="fas fa-exclamation-triangle text-yellow-600 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-gray-800">Leerstandserkennung</div>
                <div className="text-xs text-gray-500">Kosten werden NICHT auf andere Mieter umgelegt (§ 556a BGB)</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <i className="fas fa-sliders-h text-purple-600 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-gray-800">Frei definierbare Schlüssel</div>
                <div className="text-xs text-gray-500">Eigene Verteilerschlüssel erstellen</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <i className="fas fa-times-circle text-red-600 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-gray-800">Nicht umlegbare Kosten</div>
                <div className="text-xs text-gray-500">Instandhaltung wird automatisch als Vermieteranteil erkannt</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <i className="fas fa-balance-scale text-purple-600 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-gray-800">Rechtskonform</div>
                <div className="text-xs text-gray-500">BetrKV, § 556a BGB, HeizkostenV, Wirtschaftlichkeitsgebot</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <i className="fas fa-file-invoice-dollar text-green-600 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-gray-800">Automatische Abrechnung</div>
                <div className="text-xs text-gray-500">Einzelabrechnung je Mieter mit PDF-Druck</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <i className="fas fa-money-bill-wave text-emerald-600 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-gray-800">Vorauszahlungen & Saldo</div>
                <div className="text-xs text-gray-500">Guthaben/Nachzahlung automatisch berechnen</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <i className="fas fa-file-pdf text-red-600 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-gray-800">Einzel-PDFs pro Mieter</div>
                <div className="text-xs text-gray-500">Professionelle Abrechnung als PDF drucken</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <i className="fas fa-database text-gray-600 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-gray-800">100% Offline & Privat</div>
                <div className="text-xs text-gray-500">Alle Daten bleiben lokal auf Ihrem Computer</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-6">
          <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
            <i className="fas fa-gavel"></i>
            Rechtskonformität
          </h3>
          <div className="text-sm text-purple-700 space-y-2">
            <p><i className="fas fa-check text-green-600 mr-2"></i><strong>BetrKV § 2:</strong> Nur umlegbare Betriebskosten werden auf Mieter verteilt</p>
            <p><i className="fas fa-check text-green-600 mr-2"></i><strong>§ 556a BGB:</strong> Leerstandskosten werden korrekt vom Vermieter getragen</p>
            <p><i className="fas fa-check text-green-600 mr-2"></i><strong>§ 555a BGB:</strong> Instandhaltungskosten als nicht umlagbar markiert</p>
            <p><i className="fas fa-check text-green-600 mr-2"></i><strong>HeizkostenV:</strong> Hinweis auf Verbrauchserfassung bei Heizkosten</p>
            <p><i className="fas fa-check text-green-600 mr-2"></i><strong>Abrechnungsfrist:</strong> 12 Monate nach § 556 Abs. 3 BGB</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-list-ol text-blue-600"></i>
            Anleitung
          </h3>
          <div className="space-y-3">
            {[
              { n: 1, color: 'blue', title: 'Datei herunterladen', desc: 'Klicke auf den blauen Download-Button' },
              { n: 2, color: 'indigo', title: 'Objekt anlegen', desc: 'Trage Immobilie, Eigentümer und Adresse ein' },
              { n: 3, color: 'green', title: 'Einheiten & Mieter', desc: 'Wohneinheiten erfassen und Mieter zuordnen' },
              { n: 4, color: 'orange', title: 'Vorauszahlungen erfassen', desc: 'Monatliche NK-Vorauszahlungen je Mieter eintragen' },
              { n: 5, color: 'amber', title: 'Kosten eintragen', desc: 'Alle Betriebskosten mit Verteilerschlüssel erfassen' },
              { n: 6, color: 'purple', title: 'Abrechnung & PDF', desc: 'Guthaben/Nachzahlung berechnen, Einzel-PDFs pro Mieter drucken' },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full bg-${s.color}-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>{s.n}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.title}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-gray-400">
          <p>Alle Daten werden lokal in deinem Browser gespeichert (LocalStorage). Keine Daten werden an Server gesendet.</p>
          <p className="mt-1">Dies ist eine Hilfestellung und ersetzt keine anwaltliche Beratung.</p>
        </div>
      </div>
    </div>
  );
}
