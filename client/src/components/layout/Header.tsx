import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { ShieldCheck, RefreshCw, AlertTriangle, User, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, company, logout } = useAuth();
  const { conflicts } = useCompany();
  const { report, recalculate, recalculating } = useAnalytics();

  const completeness = report?.dataConfidence?.completenessPercentage ?? 0;

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {company?.name || 'My Company Workspace'}
          </span>
        </div>

        {conflicts.length > 0 && (
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-full animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{conflicts.length} Data Conflict{conflicts.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-5">
        {/* Data Quality Completeness Bar */}
        <div className="hidden md:flex items-center space-x-3 bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div className="text-xs space-y-0.5">
            <div className="flex justify-between font-medium text-slate-300">
              <span>Data Completeness</span>
              <span className="text-emerald-400 font-bold ml-2">{completeness}%</span>
            </div>
            <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>

        {/* Real-time recalculate button */}
        <button
          onClick={() => recalculate()}
          disabled={recalculating}
          className="flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Updating...' : 'Reanalyze'}</span>
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-semibold text-xs">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden lg:block text-left text-xs">
            <div className="font-semibold text-slate-200">{user?.name}</div>
            <div className="text-slate-400 text-[11px]">{user?.email}</div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
