import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { User, Building, DollarSign, Shield, LogOut, Save, Bot } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, company, logout } = useAuth();
  const { profile, updateField } = useCompany();

  const [currency, setCurrency] = useState(profile?.marketing?.currency?.value || '₹');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateField('marketing', 'currency', currency, 'manual_edit');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageContainer>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Settings & Workspace Preferences</h1>
          <p className="text-sm text-slate-400 mt-1">Manage user account, company profile settings, currency, and AI engine preferences.</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          {/* User Account Settings */}
          <div className="space-y-4 border-b border-slate-800 pb-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>User Profile & Workspace</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="text-slate-400">User Name</div>
                <div className="text-sm font-semibold text-slate-100">{user?.name}</div>
              </div>
              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="text-slate-400">Work Email</div>
                <div className="text-sm font-semibold text-slate-100">{user?.email}</div>
              </div>
              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="text-slate-400">Workspace Identifier (UUID)</div>
                <div className="text-xs font-mono text-indigo-300">{user?.workspaceId}</div>
              </div>
              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="text-slate-400">Company Identifier (UUID)</div>
                <div className="text-xs font-mono text-indigo-300">{user?.companyId}</div>
              </div>
            </div>
          </div>

          {/* Regional & Financial Preferences */}
          <div className="space-y-4 border-b border-slate-800 pb-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Currency & Financial Unit</span>
            </h2>

            <div className="flex items-center space-x-4">
              <div className="space-y-1 flex-1 max-w-xs">
                <label className="text-xs font-semibold text-slate-300">Default Currency Symbol</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="₹">₹ (INR - Indian Rupee)</option>
                  <option value="$">$ (USD - US Dollar)</option>
                  <option value="€">€ (EUR - Euro)</option>
                  <option value="£">£ (GBP - British Pound)</option>
                </select>
              </div>

              <button
                onClick={handleSave}
                className="mt-5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition-colors shadow-lg shadow-indigo-500/20"
              >
                <Save className="w-4 h-4" />
                <span>{saved ? 'Saved!' : 'Save Preferences'}</span>
              </button>
            </div>
          </div>

          {/* AI Engine Settings */}
          <div className="space-y-4 border-b border-slate-800 pb-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>AI Provider & Strict Data Governance</span>
            </h2>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span>Active Provider: Groq SDK (Llama 3.3 70B / Rule Engine)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">OPERATIONAL</span>
              </div>
              <p className="text-slate-400">
                Strict Non-Hallucination Policy: All AI recommendations and calculated metrics are validated against your verified company profile.
              </p>
            </div>
          </div>

          {/* Logout Action */}
          <div className="pt-2 flex justify-between items-center">
            <span className="text-xs text-slate-500">Tenant Data Isolation Enabled</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
