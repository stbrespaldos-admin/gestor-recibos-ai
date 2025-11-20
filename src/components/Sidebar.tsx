import React from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, UploadCloud } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Panel Principal' },
    { id: 'receipts', icon: FileText, label: 'Recibos' },
    { id: 'settings', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div className="w-20 md:w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col fixed left-0 top-0 z-20 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
           <FileText className="text-white w-5 h-5" />
        </div>
        <span className="hidden md:block font-bold text-xl text-white tracking-tight">GestorAI</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === item.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4 mb-4 hidden md:block">
          <div className="flex items-center gap-2 mb-2">
            <UploadCloud className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-300">Sincronización Nube</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 w-3/4 h-full rounded-full"></div>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">1.2GB / 5GB Usado</span>
        </div>

        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="hidden md:block font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};