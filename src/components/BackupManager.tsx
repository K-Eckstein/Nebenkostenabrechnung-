import { useState, useRef } from 'react';
import { AppData } from '../store';

interface Props {
  data: AppData;
  onImport: (json: string) => boolean;
}

export default function BackupManager({ data, onImport }: Props) {
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const backupObj = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      app: 'Nebenkostenabrechnung',
      data: data,
    };
    
    const jsonString = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const dateStr = new Date().toISOString().split('T')[0];
    const propName = data.properties[0]?.name?.replace(/[^a-z0-9]/gi, '_') || 'Backup';
    
    a.href = url;
    a.download = `Nebenkosten_Backup_${propName}_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    localStorage.setItem('last_backup_export', new Date().toISOString());
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Möchten Sie dieses Backup wirklich einspielen? Alle aktuellen Daten werden überschrieben!')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      // Prüfen ob es unser Format ist (mit "data"-Wrapper) oder das alte Format (direkt AppData)
      let dataToImport = json;
      try {
        const parsed = JSON.parse(json);
        if (parsed.data && parsed.app === 'Nebenkostenabrechnung') {
          dataToImport = JSON.stringify(parsed.data); // Unwrap
        }
      } catch (e) {}

      const ok = onImport(dataToImport);
      if (ok) {
        alert('✅ Backup erfolgreich eingespielt! Die Seite wird nun neu geladen.');
        window.location.reload();
      } else {
        alert('❌ Fehler beim Einlesen des Backups. Ist die Datei korrekt?');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const lastExport = localStorage.getItem('last_backup_export');
  const lastRestore = localStorage.getItem('last_backup_restore');

  const totalCounts = 
    data.properties.length + 
    data.units.length + 
    data.tenants.length + 
    data.costs.length + 
    data.prepayments.length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Daten & Backup</h2>
        <p className="text-gray-500 text-sm mt-1">
          Sichern Sie Ihre Daten als JSON-Datei. Alle Daten liegen lokal auf Ihrem Rechner.
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
            <i className="fas fa-shield-alt text-white text-xl"></i>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Wichtig: Regelmäßig sichern!</h3>
            <p className="text-sm text-gray-600">Die Daten liegen im Browser (localStorage). Bei Cache-Löschung sind sie weg.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-xs text-gray-500">Letzter Export</div>
            <div className="font-semibold text-gray-800 mt-1">
              {lastExport ? new Date(lastExport).toLocaleString('de-DE') : 'Noch nie'}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-xs text-gray-500">Letzter Import</div>
            <div className="font-semibold text-gray-800 mt-1">
              {lastRestore ? new Date(lastRestore).toLocaleString('de-DE') : 'Noch nie'}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExport}
            className="flex-1 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
          >
            <i className="fas fa-download"></i> Backup erstellen (Export)
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
          >
            <i className="fas fa-upload"></i> Backup einspielen (Import)
          </button>
          
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
          />
        </div>
        
        {success && (
          <div className="mt-4 text-sm text-green-700 bg-green-100 border border-green-200 p-2 rounded-lg text-center">
            <i className="fas fa-check-circle mr-1"></i> Backup-Datei wurde heruntergeladen!
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Aktuelle Datenmenge</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gray-800">{data.properties.length}</div>
            <div className="text-xs text-gray-500">Objekte</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gray-800">{data.units.length}</div>
            <div className="text-xs text-gray-500">Einheiten</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gray-800">{data.tenants.length}</div>
            <div className="text-xs text-gray-500">Mieter</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gray-800">{data.costs.length}</div>
            <div className="text-xs text-gray-500">Kosten</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gray-800">{data.prepayments.length}</div>
            <div className="text-xs text-gray-500">Vorauszahlungen</div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <i className="fas fa-info-circle mr-2"></i>
        <strong>Wichtig:</strong> Die Backup-Datei enthält alle Ihre Daten im Klartext (JSON). Bewahren Sie sie sicher auf. Wenn Sie ein Backup einspielen, werden alle aktuellen Daten überschrieben.
      </div>
    </div>
  );
}
