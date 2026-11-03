import { useState } from 'react';
import { useAppData } from './store';
import Dashboard from './components/Dashboard';
import UnitsManager from './components/UnitsManager';
import TenantsManager from './components/TenantsManager';
import CostsManager from './components/CostsManager';
import Settlement from './components/Settlement';
import PropertyManager from './components/PropertyManager';
import PrepaymentsManager from './components/PrepaymentsManager';
import BackupManager from './components/BackupManager';
import LettersManager from './components/LettersManager';
import ArchiveManager from './components/ArchiveManager';

type Tab = 'property' | 'dashboard' | 'units' | 'tenants' | 'prepayments' | 'costs' | 'settlement' | 'letters' | 'archive' | 'backup';

interface NavItem { id: Tab; label: string; icon: string; }

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
  { id: 'property', label: 'Objekte & Vermieter', icon: 'fas fa-home' },
  { id: 'units', label: 'Wohneinheiten', icon: 'fas fa-building' },
  { id: 'tenants', label: 'Mieter', icon: 'fas fa-users' },
  { id: 'prepayments', label: 'Vorauszahlungen', icon: 'fas fa-money-bill-wave' },
  { id: 'costs', label: 'Betriebskosten', icon: 'fas fa-receipt' },
  { id: 'settlement', label: 'Abrechnung', icon: 'fas fa-file-invoice-dollar' },
  { id: 'letters', label: 'Mieteranschreiben', icon: 'fas fa-envelope' },
  { id: 'archive', label: 'Archiv & Finanzamt', icon: 'fas fa-archive' },
  { id: 'backup', label: 'Daten & Backup', icon: 'fas fa-shield-alt' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showAbout, setShowAbout] = useState(false);
  const appData = useAppData();

  const {
    properties, activePropertyId, setActiveProperty, addProperty, updateProperty,
    units, addUnit, updateUnit, deleteUnit,
    tenants, addTenant, updateTenant, deleteTenant,
    prepayments, addPrepayment, updatePrepayment, deletePrepayment,
    costs, addCost, updateCost, deleteCost,
    archiveYear, unarchiveYear,
    importData,
  } = appData;

  const activeProperty = properties.find(p => p.id === activePropertyId);

  const activeUnits = units.filter(u => u.propertyId === activePropertyId);
  const activeTenants = tenants.filter(t => t.propertyId === activePropertyId);
  const activeCosts = costs.filter(c => c.propertyId === activePropertyId);
  const activePrepayments = prepayments.filter(p => p.propertyId === activePropertyId);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-screen print:hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center"><i className="fas fa-calculator text-white"></i></div>
          <div>
            <div className="font-bold text-sm text-gray-800">{activeProperty?.name || 'Nebenkosten'}</div>
            <div className="text-xs text-gray-500">{activeProperty?.address || 'Abrechnung'}</div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${tab === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <i className={`${item.icon} w-5 text-center`}></i><span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button onClick={() => setShowAbout(true)} className="w-full text-left text-xs text-gray-500 hover:text-blue-600 flex items-center gap-2 transition-colors">
            <i className="fas fa-info-circle w-4"></i>
            <span>Über diese App</span>
          </button>
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <i className="fas fa-database w-4"></i>
            <span>Lokale Speicherung</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 flex justify-between items-center print:hidden">
          <h1 className="text-lg font-bold text-gray-800">{NAV_ITEMS.find((n) => n.id === tab)?.label}</h1>
          {properties.length > 1 && (
            <select value={activePropertyId || ''} onChange={(e) => setActiveProperty(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1 text-sm bg-gray-50">
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
        </header>

        <div className="p-6 max-w-6xl mx-auto print:p-0 print:max-w-full">
          {(!activePropertyId && tab !== 'property' && tab !== 'backup') ? (
            <div className="text-center py-20 text-gray-500">Bitte legen Sie zuerst unter "Objekte & Vermieter" ein Objekt an.</div>
          ) : (
            <>
              {tab === 'property' && <PropertyManager properties={properties} activePropertyId={activePropertyId} onSelect={setActiveProperty} onAdd={addProperty} onUpdate={updateProperty} />}
              {tab === 'dashboard' && <Dashboard tenants={activeTenants} units={activeUnits} costs={activeCosts} />}
              {tab === 'units' && <UnitsManager units={activeUnits} onAdd={addUnit} onUpdate={updateUnit} onDelete={deleteUnit} />}
              {tab === 'tenants' && <TenantsManager tenants={activeTenants} units={activeUnits} onAdd={addTenant} onUpdate={updateTenant} onDelete={deleteTenant} />}
              {tab === 'prepayments' && <PrepaymentsManager prepayments={activePrepayments} tenants={activeTenants} units={activeUnits} onAdd={addPrepayment} onUpdate={updatePrepayment} onDelete={deletePrepayment} />}
              {tab === 'costs' && <CostsManager costs={activeCosts} onAdd={addCost} onUpdate={updateCost} onDelete={deleteCost} />}
              {tab === 'settlement' && <Settlement tenants={activeTenants} units={activeUnits} costs={activeCosts} prepayments={activePrepayments} property={activeProperty} />}
              {tab === 'letters' && <LettersManager tenants={activeTenants} units={activeUnits} costs={activeCosts} prepayments={activePrepayments} property={activeProperty} />}
              {tab === 'archive' && activeProperty && <ArchiveManager property={activeProperty} tenants={activeTenants} units={activeUnits} costs={activeCosts} prepayments={activePrepayments} onArchive={(y) => archiveYear(activeProperty.id, y)} onUnarchive={(y) => unarchiveYear(activeProperty.id, y)} />}
              {tab === 'backup' && <BackupManager data={appData} onImport={importData} />}
            </>
          )}
        </div>
      </main>

      {/* Über-Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setShowAbout(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <i className="fas fa-calculator text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Nebenkostenabrechnung</h3>
                  <p className="text-sm text-gray-500">Version 1.2.0</p>
                </div>
              </div>
              <button onClick={() => setShowAbout(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <p>
                Rechtskonforme Betriebskostenverwaltung nach deutschem Mietrecht – 
                BetrKV, § 556 BGB, HeizkostenV und CO2KostAufG.
              </p>

              <div className="border-t border-gray-100 pt-3">
                <p className="font-semibold text-gray-800 mb-1">Entwickelt von</p>
                <p className="text-gray-600">Klaus Eckstein</p>
                <p className="text-xs text-gray-500 mt-1">
                  mit freundlicher Unterstützung von <strong>DeepSeek</strong> (KI-Assistenz)
                </p>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="font-semibold text-gray-800 mb-1">Technologien</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Electron', 'html2pdf'].map(t => (
                    <span key={t} className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">{t}</span>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 bg-gray-50 -mx-6 px-6 -mb-6 py-3 rounded-b-2xl">
                <p className="text-xs text-gray-500 flex items-start gap-2">
                  <i className="fas fa-shield-alt text-gray-400 mt-0.5"></i>
                  <span>Alle Daten bleiben lokal auf Ihrem Rechner. Keine Cloud, kein Tracking.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
