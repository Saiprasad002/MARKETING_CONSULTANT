import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useCompany } from '../context/CompanyContext';
import { SourceBadge } from '../components/ui/Badge';
import { Building, Target, Users, BarChart2, Award, Sparkles, Check, Edit3, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, updateField, loadingProfile } = useCompany();
  const [activeTab, setActiveTab] = useState<'identity' | 'businessDescription' | 'targetCustomer' | 'competition' | 'marketing' | 'goals'>('identity');

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>('');

  if (loadingProfile) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96 text-slate-400">
          Loading company profile...
        </div>
      </PageContainer>
    );
  }

  const handleStartEdit = (fieldKey: string, currentVal: any) => {
    setEditingField(fieldKey);
    setEditValue(Array.isArray(currentVal) ? currentVal.join(', ') : currentVal || '');
  };

  const handleSaveEdit = async (sectionKey: string, fieldKey: string, isArray = false) => {
    let finalVal = editValue;
    if (isArray && typeof editValue === 'string') {
      finalVal = editValue.split(',').map(s => s.trim()).filter(Boolean);
    }
    await updateField(sectionKey, fieldKey, finalVal, 'manual_edit');
    setEditingField(null);
  };

  const renderFieldRow = (sectionKey: string, fieldKey: string, label: string, isArray = false) => {
    const meta = (profile as any)?.[sectionKey]?.[fieldKey];
    const isEditing = editingField === fieldKey;

    const valDisplay = meta?.value !== undefined && meta?.value !== null && meta?.value !== ''
      ? (Array.isArray(meta.value) ? meta.value.join(', ') : String(meta.value))
      : null;

    return (
      <div key={fieldKey} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</span>
            {meta?.source && <SourceBadge source={meta.source} confidence={meta.confidence} />}
          </div>
          {!isEditing ? (
            <button
              onClick={() => handleStartEdit(fieldKey, meta?.value)}
              className="p-1 text-slate-400 hover:text-indigo-400 rounded transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => handleSaveEdit(sectionKey, fieldKey, isArray)}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded flex items-center space-x-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-indigo-500/50 rounded text-slate-100 text-sm focus:outline-none"
            autoFocus
          />
        ) : (
          <div className="text-sm font-semibold text-slate-100">
            {valDisplay ? (
              <span className="text-slate-100">{valDisplay}</span>
            ) : (
              <span className="text-slate-500 italic text-xs">Not provided</span>
            )}
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { key: 'identity', label: 'Company Identity', icon: Building },
    { key: 'businessDescription', label: 'Products & Services', icon: Sparkles },
    { key: 'targetCustomer', label: 'Target Customer', icon: Users },
    { key: 'competition', label: 'Competition', icon: Target },
    { key: 'marketing', label: 'Marketing Metrics', icon: BarChart2 },
    { key: 'goals', label: 'Business Goals', icon: Award }
  ];

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Structured Company Profile</h1>
          <p className="text-sm text-slate-400 mt-1">
            Every analytical result is derived directly from these verified facts. Click any field to edit.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          {activeTab === 'identity' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFieldRow('identity', 'name', 'Company Name')}
              {renderFieldRow('identity', 'website', 'Website URL')}
              {renderFieldRow('identity', 'industry', 'Industry')}
              {renderFieldRow('identity', 'subIndustry', 'Sub-Industry')}
              {renderFieldRow('identity', 'businessType', 'Business Model')}
              {renderFieldRow('identity', 'startupStage', 'Startup Stage')}
              {renderFieldRow('identity', 'location', 'Headquarters Location')}
              {renderFieldRow('identity', 'employeesCount', 'Team Size')}
            </div>
          )}

          {activeTab === 'businessDescription' && (
            <div className="space-y-4">
              {renderFieldRow('businessDescription', 'description', 'Business Description')}
              {renderFieldRow('businessDescription', 'productsServices', 'Products & Services', true)}
              {renderFieldRow('businessDescription', 'usp', 'Unique Selling Proposition (USP)')}
              {renderFieldRow('businessDescription', 'businessModel', 'Revenue Model')}
              {renderFieldRow('businessDescription', 'pricingModel', 'Pricing Model')}
            </div>
          )}

          {activeTab === 'targetCustomer' && (
            <div className="space-y-4">
              {renderFieldRow('targetCustomer', 'idealCustomer', 'Ideal Customer Profile')}
              {renderFieldRow('targetCustomer', 'demographics', 'Demographics')}
              {renderFieldRow('targetCustomer', 'geography', 'Target Geography')}
              {renderFieldRow('targetCustomer', 'painPoints', 'Customer Pain Points', true)}
              {renderFieldRow('targetCustomer', 'motivations', 'Customer Motivations', true)}
            </div>
          )}

          {activeTab === 'competition' && (
            <div className="space-y-4">
              {renderFieldRow('competition', 'competitors', 'Main Competitors', true)}
              {renderFieldRow('competition', 'competitiveAdvantages', 'Competitive Advantages', true)}
              {renderFieldRow('competition', 'marketPosition', 'Market Positioning')}
            </div>
          )}

          {activeTab === 'marketing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFieldRow('marketing', 'currentChannels', 'Active Channels', true)}
              {renderFieldRow('marketing', 'monthlyBudget', 'Monthly Marketing Budget')}
              {renderFieldRow('marketing', 'currency', 'Currency')}
              {renderFieldRow('marketing', 'currentCac', 'Current CAC')}
              {renderFieldRow('marketing', 'currentRoas', 'Current ROAS')}
              {renderFieldRow('marketing', 'conversionRate', 'Conversion Rate (%)')}
              {renderFieldRow('marketing', 'monthlyRevenue', 'Monthly Revenue')}
              {renderFieldRow('marketing', 'websiteTraffic', 'Monthly Website Traffic')}
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-4">
              {renderFieldRow('goals', 'primaryGoal', 'Primary Growth Goal')}
              {renderFieldRow('goals', 'secondaryGoals', 'Secondary Objectives', true)}
              {renderFieldRow('goals', 'growthTargets', 'Target Growth Milestones')}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
