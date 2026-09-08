import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useAnalytics } from '../context/AnalyticsContext';
import { useCompany } from '../context/CompanyContext';
import { MetricStatusBadge } from '../components/ui/Badge';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { 
  TrendingUp, ShieldCheck, Activity, Target, AlertCircle, ArrowUpRight, PlusCircle, Upload, MessageSquare 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { report, loadingAnalytics } = useAnalytics();
  const { profile } = useCompany();

  if (loadingAnalytics) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-3 text-indigo-400">
            <Activity className="w-6 h-6 animate-spin" />
            <span className="text-sm font-semibold">Calculating real-time company analytics...</span>
          </div>
        </div>
      </PageContainer>
    );
  }

  const health = report?.businessHealth;
  const readiness = report?.marketingReadiness;
  const growth = report?.executiveSummary ? report : null;
  const kpis = report?.kpiAnalysis;
  const budget = report?.budgetAllocation;
  const channels = report?.channelAnalysis || [];
  const funnel = report?.funnel || [];

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981'];

  const isEmptyState = !profile?.identity?.name?.value && (!budget?.items || budget.items.length === 0);

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Executive Analytics Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Evidence-based strategy diagnostic for <span className="text-indigo-300 font-semibold">{report?.companyName || 'Your Company'}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/consultant"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors shadow-lg shadow-indigo-500/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Talk to AI Consultant</span>
            </Link>
            <Link
              to="/documents"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors border border-slate-700"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </Link>
          </div>
        </div>

        {/* Verification / Insufficient Data Warning Banner */}
        {(!health?.score || health.score < 20) && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-300">Company Information Could Not Be Verified</h3>
              <p className="text-xs text-amber-200/80">
                Insufficient verified data to generate a reliable strategic analysis. Unreliable scores will not be generated. Please provide verified company details or upload documents to calculate valid metrics.
              </p>
              <div className="pt-2 flex items-center space-x-3">
                <Link to="/profile" className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors">
                  Add Verified Company Details
                </Link>
                <Link to="/consultant" className="text-xs text-amber-300 font-semibold hover:underline">
                  Tell AI Consultant
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 4 Score Hero Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Business Health */}
          <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Business Health</span>
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-100">{health?.score ?? 0}</span>
              <span className="text-xs text-slate-500 font-semibold">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${health?.score || 0}%` }} />
            </div>
            <div className="text-[11px] text-slate-400">
              Confidence: <span className="text-indigo-400 font-semibold">{Math.round((health?.confidence || 0) * 100)}%</span>
            </div>
          </div>

          {/* Marketing Readiness */}
          <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Marketing Readiness</span>
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-100">{readiness?.score ?? 0}</span>
              <span className="text-xs text-slate-500 font-semibold">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${readiness?.score || 0}%` }} />
            </div>
            <div className="text-[11px] text-slate-400">
              {readiness?.positiveFactors?.length || 0} Positive Factors Verified
            </div>
          </div>

          {/* Growth Potential */}
          <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Growth Opportunity</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-emerald-400 leading-snug">
              {readiness?.score && readiness.score >= 50 ? 'High Scale Opportunity' : 'Growth Assessment Pending'}
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">
              {readiness?.positiveFactors?.[0] || 'Provide budget and acquisition channel metrics to evaluate expansion potential.'}
            </p>
          </div>

          {/* Data Confidence */}
          <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Completeness</span>
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-100">{report?.dataConfidence?.completenessPercentage ?? 0}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${report?.dataConfidence?.completenessPercentage || 0}%` }} />
            </div>
            <div className="text-[11px] text-slate-400">
              {report?.dataConfidence?.missingFields?.length || 0} Missing Data Points
            </div>
          </div>
        </div>

        {/* Real KPI Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Key Performance Metrics</h2>
            <span className="text-xs text-slate-400">Strict Non-Hallucination Guarantee</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CAC Card */}
            <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">Customer Acquisition Cost (CAC)</span>
                <MetricStatusBadge status={kpis?.cac?.status || 'INSUFFICIENT_DATA'} />
              </div>
              <div className="text-xl font-bold text-slate-100">
                {kpis?.cac?.value || 'Insufficient data'}
              </div>
              <div className="text-[11px] text-slate-500">
                {kpis?.cac?.explanation || 'Calculated from spend divided by customer sales.'}
              </div>
            </div>

            {/* ROAS Card */}
            <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">Return on Ad Spend (ROAS)</span>
                <MetricStatusBadge status={kpis?.roas?.status || 'INSUFFICIENT_DATA'} />
              </div>
              <div className="text-xl font-bold text-slate-100">
                {kpis?.roas?.value || 'Insufficient data'}
              </div>
              <div className="text-[11px] text-slate-500">
                {kpis?.roas?.explanation || 'Calculated from revenue divided by ad budget.'}
              </div>
            </div>

            {/* Monthly Revenue Card */}
            <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">Monthly Revenue Baseline</span>
                <MetricStatusBadge status={kpis?.revenue?.status || 'INSUFFICIENT_DATA'} />
              </div>
              <div className="text-xl font-bold text-slate-100">
                {kpis?.revenue?.value || 'Insufficient data'}
              </div>
              <div className="text-[11px] text-slate-500">
                {kpis?.revenue?.explanation || 'Provided by company.'}
              </div>
            </div>

            {/* Conversion Rate Card */}
            <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">Website Conversion Rate</span>
                <MetricStatusBadge status={kpis?.conversionRate?.status || 'INSUFFICIENT_DATA'} />
              </div>
              <div className="text-xl font-bold text-slate-100">
                {kpis?.conversionRate?.value || 'Insufficient data'}
              </div>
              <div className="text-[11px] text-slate-500">
                {kpis?.conversionRate?.explanation || 'Requires total traffic and total conversion numbers.'}
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Analytics Visuals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Allocation Chart */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">Strategic Budget Allocation</h3>
              <span className="text-xs font-semibold text-indigo-400">
                {budget?.totalBudget ? `${budget.currency}${budget.totalBudget.toLocaleString()}` : 'Budget Unallocated'}
              </span>
            </div>

            {budget?.items && budget.items.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budget.items}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={entry => `${entry.category}: ${entry.percentage}%`}
                    >
                      {budget.items.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      formatter={(value: any) => [`${budget.currency}${value.toLocaleString()}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl p-6 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-slate-600" />
                <div className="text-sm font-semibold text-slate-400">No marketing budget provided yet.</div>
                <Link to="/profile" className="px-3.5 py-1.5 bg-indigo-600/20 text-indigo-300 text-xs font-medium rounded-lg border border-indigo-500/30">
                  Add Marketing Budget
                </Link>
              </div>
            )}
          </div>

          {/* Marketing Channel Priority Chart */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">Channel Fit & Fit Scores</h3>
              <span className="text-xs text-slate-400">{channels.length} Channels Analyzed</span>
            </div>

            {channels.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channels} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="channel" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Bar dataKey="fitScore" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl p-6 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-slate-600" />
                <div className="text-sm font-semibold text-slate-400">No marketing channel information available yet.</div>
                <Link to="/profile" className="px-3.5 py-1.5 bg-indigo-600/20 text-indigo-300 text-xs font-medium rounded-lg border border-indigo-500/30">
                  Specify Channels
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Data Gaps & Recommendations Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Priorities */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">Top Strategic Recommendations</h3>
              <Link to="/recommendations" className="text-xs text-indigo-400 hover:underline flex items-center space-x-1">
                <span>View All ({report?.recommendations?.length || 0})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {report?.recommendations?.slice(0, 3).map(rec => (
                <div key={rec.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300">{rec.title}</span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{rec.priority}</span>
                  </div>
                  <p className="text-xs text-slate-400">{rec.rationale}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Data Quality Missing Fields Checklist */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">Information Gaps to Improve Precision</h3>
              <span className="text-xs text-rose-400 font-semibold">{health?.missingData?.length || 0} Gaps</span>
            </div>

            {health?.missingData && health.missingData.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {health.missingData.map((field, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-xs">
                    <span className="text-slate-300 capitalize">{field.replace('.', ' → ')}</span>
                    <Link to="/profile" className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1">
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Data</span>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-medium text-center">
                All primary company data fields are complete! Your analytics score operates at peak precision.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
