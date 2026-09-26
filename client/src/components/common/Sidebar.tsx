import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Layers,
  Milk,
  Egg,
  Package,
  Pill,
  Boxes,
  TrendingUp,
  Users,
  DollarSign,
  UserCheck,
  PieChart,
  FileText,
  Bell,
  Settings,
  ChevronDown,
  X,
  Sparkles,
  Wheat
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Collapsible parent menus
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    farm: true,
    livestock: true,
    poultry: true,
    production: true,
    resources: true,
    business: true
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-emerald-600 text-white shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  const subNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
      isActive
        ? 'text-emerald-700 bg-emerald-50/80 font-bold'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-card">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-800">
                Agro<span className="text-emerald-600">Sphere</span>
              </span>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5">
                Farm SaaS
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
          {/* Main Dashboard */}
          <div>
            <NavLink to="/dashboard" onClick={onClose} className={navLinkClass}>
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Unified Dashboard</span>
            </NavLink>
          </div>

          {/* Section: Farm Management */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('farm')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600"
            >
              <span>Farm Management</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openSections.farm ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSections.farm && (
              <div className="pl-2 space-y-0.5 border-l border-slate-100 ml-3">
                <NavLink to="/farm/profile" onClick={onClose} className={subNavLinkClass}>
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  <span>Farm Profile</span>
                </NavLink>
                <NavLink to="/farm/sheds" onClick={onClose} className={subNavLinkClass}>
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span>Sheds & Locations</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Section: Livestock */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('livestock')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600"
            >
              <span>Livestock (Cattle/Buffalo)</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openSections.livestock ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSections.livestock && (
              <div className="pl-2 space-y-0.5 border-l border-slate-100 ml-3">
                <NavLink to="/livestock/animals" onClick={onClose} className={subNavLinkClass}>
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Animals & Breeding</span>
                </NavLink>
                <NavLink to="/livestock/health" onClick={onClose} className={subNavLinkClass}>
                  <Pill className="w-3.5 h-3.5 shrink-0" />
                  <span>Health & Vaccinations</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Section: Poultry */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('poultry')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600"
            >
              <span>Poultry Farming</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openSections.poultry ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSections.poultry && (
              <div className="pl-2 space-y-0.5 border-l border-slate-100 ml-3">
                <NavLink to="/poultry/batches" onClick={onClose} className={subNavLinkClass}>
                  <Egg className="w-3.5 h-3.5 shrink-0" />
                  <span>Flock Batches</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Section: Production */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('production')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600"
            >
              <span>Production Daily</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openSections.production ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSections.production && (
              <div className="pl-2 space-y-0.5 border-l border-slate-100 ml-3">
                <NavLink to="/production/milk" onClick={onClose} className={subNavLinkClass}>
                  <Milk className="w-3.5 h-3.5 shrink-0" />
                  <span>Milk Production</span>
                </NavLink>
                <NavLink to="/production/eggs" onClick={onClose} className={subNavLinkClass}>
                  <Egg className="w-3.5 h-3.5 shrink-0" />
                  <span>Egg Production</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Section: Resources & Inventory */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('resources')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600"
            >
              <span>Resources & Stock</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openSections.resources ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSections.resources && (
              <div className="pl-2 space-y-0.5 border-l border-slate-100 ml-3">
                <NavLink to="/resources/feed" onClick={onClose} className={subNavLinkClass}>
                  <Wheat className="w-3.5 h-3.5 shrink-0" />
                  <span>Feed Management</span>
                </NavLink>
                <NavLink to="/resources/medicines" onClick={onClose} className={subNavLinkClass}>
                  <Pill className="w-3.5 h-3.5 shrink-0" />
                  <span>Medicines & Pharmacy</span>
                </NavLink>
                <NavLink to="/resources/inventory" onClick={onClose} className={subNavLinkClass}>
                  <Boxes className="w-3.5 h-3.5 shrink-0" />
                  <span>Central Inventory</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Section: Business & Commercial */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('business')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600"
            >
              <span>Commercial & Ops</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openSections.business ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSections.business && (
              <div className="pl-2 space-y-0.5 border-l border-slate-100 ml-3">
                <NavLink to="/business/sales" onClick={onClose} className={subNavLinkClass}>
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span>Sales & Invoices</span>
                </NavLink>
                <NavLink to="/business/customers" onClick={onClose} className={subNavLinkClass}>
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>Customer Directory</span>
                </NavLink>
                <NavLink to="/business/expenses" onClick={onClose} className={subNavLinkClass}>
                  <DollarSign className="w-3.5 h-3.5 shrink-0" />
                  <span>Expense Tracker</span>
                </NavLink>
                <NavLink to="/business/employees" onClick={onClose} className={subNavLinkClass}>
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Staff & Attendance</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Finance & Insights */}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <NavLink to="/finance" onClick={onClose} className={navLinkClass}>
              <PieChart className="w-4 h-4 shrink-0" />
              <span>Financial Overview</span>
            </NavLink>

            <NavLink to="/reports" onClick={onClose} className={navLinkClass}>
              <FileText className="w-4 h-4 shrink-0" />
              <span>Comprehensive Reports</span>
            </NavLink>

            <NavLink to="/notifications" onClick={onClose} className={navLinkClass}>
              <Bell className="w-4 h-4 shrink-0" />
              <span>Notification Center</span>
            </NavLink>

            <NavLink to="/settings" onClick={onClose} className={navLinkClass}>
              <Settings className="w-4 h-4 shrink-0" />
              <span>Farm Settings</span>
            </NavLink>
          </div>
        </div>

        {/* User Card in Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Farm User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.role || 'Operator'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
