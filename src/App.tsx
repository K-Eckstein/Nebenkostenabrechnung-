import { useState } from 'react';
import { useAppData } from './store';
import Dashboard from './components/Dashboard';
import UnitsManager from './components/UnitsManager';
import TenantsManager from './components/TenantsManager';
import CostsManager from './components/CostsManager';
import Settlement from './components/Settlement';

type Tab = 'dashboard' | 'units' | 'tenants' | 'costs' | 'settlement';

const TABS: { id: Tab; label: string; icon: string; activeClass: string; activeIconClass: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', activeClass: 'bg-blue-50 text-blue-700', activeIconClass: 'text-blue-600' },
  { id: 'units', label: 'Wohneinheiten', icon: 'fas fa-building', activeClass: 'bg-indigo-50 text-indigo-700', activeIconClass: 'text-indigo-600' },
  { id: 'tenants', label: 'Mieter', icon: 'fas fa-users', activeClass: 'bg-green-50 text-green-700', activeIconClass: 'text-green-600' },
  { id: 'costs', label: 'Kosten', icon: 'fas fa-receipt', activeClass: 'bg-orange-50 text-orange-700', activeIconClass: 'text-orange-600' },
  { id: 'settlement', label: 'Abrechnung', icon: 'fas fa-file-invoice-dollar', activeClass: 'bg-purple-50 text-purple-700', activeIconClass: 'text-purple-600' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const data = useAppData();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard tenants={data.tenants} units={data.units} costs={data.costs} />;
      case 'units':
        return (
          <UnitsManager
            units={data.units}
            onAdd={data.addUnit}
            onUpdate={data.updateUnit}
            onDelete={data.deleteUnit}
          />
        );
      case 'tenants':
        return (
          <TenantsManager
            tenants={data.tenants}
            units={data.units}
            onAdd={data.addTenant}
            onUpdate={data.updateTenant}
            onDelete={data.deleteTenant}
          />
        );
      case 'costs':
        return (
          <CostsManager
            costs={data.costs}
            onAdd={data.addCost}
            onUpdate={data.updateCost}
            onDelete={data.deleteCost}
          />
        );
      case 'settlement':
        return (
          <Settlement
            tenants={data.tenants}
            units={data.units}
            costs={data.costs}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-calculator text-white text-lg"></i>
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-gray-800 text-sm leading-tight">Nebenkosten</h1>
                <p className="text-xs text-gray-500">Abrechnung</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                activeTab === tab.id
                  ? tab.activeClass
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
              title={tab.label}
            >
              <i className={`${tab.icon} w-5 text-center ${activeTab === tab.id ? tab.activeIconClass : ''}`}></i>
              {sidebarOpen && <span className="text-sm font-medium">{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <i className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`}></i>
            {sidebarOpen && <span className="text-sm">Einklappen</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {TABS.find((t) => t.id === activeTab)?.label}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                <i className="fas fa-database mr-1"></i>
                Daten lokal gespeichert
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
