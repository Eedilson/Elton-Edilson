
import React from 'react';
import { ViewState } from '../types';
import { 
  LayoutDashboard, 
  Package, 
  Store, 
  ShoppingCart, 
  CreditCard, 
  BarChart2, 
  Users, 
  Banknote, 
  ShieldCheck,
  Ticket, 
  HelpCircle,
  Filter,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isMobileOpen, setIsMobileOpen }) => {
  
  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.PRODUCTS, label: 'Produtos', icon: Package },
    { id: ViewState.MEMBERS_AREA, label: 'Área de Membros', icon: GraduationCap }, // Added
    { id: ViewState.VITRINE, label: 'Vitrine', icon: Store, badge: 'Novo' },
    { id: ViewState.SALES, label: 'Minhas Vendas', icon: ShoppingCart },
    // Removido: Assinaturas, Relatórios
    { id: ViewState.AFFILIATES, label: 'Afiliados', icon: Users },
    { id: ViewState.FINANCE, label: 'Financeiro', icon: Banknote },
    { id: ViewState.INTEGRATIONS, label: 'Integrações', icon: ShieldCheck },
    // Removido: Cupons
  ];

  const bottomItems = [
    { label: 'Quiz', icon: HelpCircle, badge: 'Novo' },
    { label: 'Funeleiro', icon: Filter, badge: 'Beta' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-70 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f1419] text-gray-400 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-gray-800`}>
        <div className="flex items-center h-16 px-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-emerald-500">SIMBA</h1>
          </div>
        </div>

        <div className="flex flex-col justify-between h-[calc(100%-4rem)] overflow-y-auto custom-scrollbar">
          <div className="mt-6">
            {/* Create Button Removed from here */}
          </div>

          <nav className="px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg group ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-emerald-500' : 'text-gray-500 group-hover:text-white'}`} />
                    {item.label}
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      item.badge === 'Novo' 
                        ? 'border-emerald-500 text-emerald-500' 
                        : 'border-blue-500 text-blue-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 space-y-1 mt-auto border-t border-gray-800">
             {bottomItems.map((item, idx) => (
                <button
                  key={idx}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-400 transition-all duration-200 rounded-lg hover:bg-gray-800/50 hover:text-white group"
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-white" />
                    {item.label}
                  </div>
                   {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      item.badge === 'Novo' 
                        ? 'border-emerald-500 text-emerald-500' 
                        : 'border-emerald-500 text-emerald-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
             ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
