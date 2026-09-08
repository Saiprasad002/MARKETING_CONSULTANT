import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  BarChart3, 
  Building2, 
  FileText, 
  Sparkles, 
  FileSpreadsheet, 
  Settings 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Consultant', path: '/consultant', icon: Bot },
    { label: 'Company Profile', path: '/profile', icon: Building2 },
    { label: 'Document Intelligence', path: '/documents', icon: FileText },
    { label: 'Recommendations', path: '/recommendations', icon: Sparkles },
    { label: 'Executive Report', path: '/report', icon: FileSpreadsheet },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-100 tracking-wide">AI CONSULTANT</div>
            <div className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Marketing Engine</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Main Navigation</div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/60 text-xs text-slate-500 flex justify-between items-center">
        <span>Zero-Fake Data Engine</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
      </div>
    </aside>
  );
};
