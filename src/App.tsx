import { useState } from 'react';

export default function App() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    // Direkter Download-Link
    const a = document.createElement('a');
    a.href = './nebenkosten.html';
    a.download = 'Nebenkostenabrechnung.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <i className="fas fa-calculator text-white text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Nebenkostenabrechnung</h1>
          <p className="text-gray-500 text-lg">Betriebskostenverwaltung für Vermieter</p>
        </div>

        {/* Download Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-download text-green-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Standalone-Version herunterladen</h2>
              <p className="text-gray-500">
                Lade die vollständige Anwendung als einzelne HTML-Datei herunter. 
                Einfach per Doppelklick im Browser öffnen – keine Installation nötig!
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
              <strong>Tipp:</strong> Nach dem Download die Datei einfach doppelklicken – sie öffnet sich im Browser und funktioniert komplett offline!
            </p>
            <p className="text-xs text-blue-600">
              <i className="fas fa-link mr-1"></i>
              Alternativ: <a href="./nebenkosten.html" target="_blank" className="underline font-medium">Direkt zur Standalone-Version</a>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-building text-blue-600"></i>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Wohneinheiten</h3>
            <p className="text-xs text-gray-500 mt-1">Verwalte alle Wohnungen und Flächen</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-users text-green-600"></i>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Mieterverwaltung</h3>
            <p className="text-xs text-gray-500 mt-1">Mieter mit Ein-/Auszugsdaten</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-file-invoice-dollar text-purple-600"></i>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Abrechnung</h3>
            <p className="text-xs text-gray-500 mt-1">Automatische Kostenverteilung</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-list-ol text-blue-600"></i>
            So funktioniert's
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Datei herunterladen</p>
                <p className="text-xs text-gray-500">Klicke auf den blauen Download-Button oben</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Datei öffnen</p>
                <p className="text-xs text-gray-500">Doppelklick auf die heruntergeladene HTML-Datei</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Daten eingeben</p>
                <p className="text-xs text-gray-500">Wohneinheiten → Mieter → Kosten erfassen</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Abrechnung erstellen</p>
                <p className="text-xs text-gray-500">Unter "Abrechnung" die Aufstellung ansehen und drucken</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-400">
          <p>Alle Daten werden lokal in deinem Browser gespeichert (LocalStorage).</p>
          <p className="mt-1">Keine Daten werden an Server gesendet. 100% offline-fähig.</p>
        </div>
      </div>
    </div>
  );
}
