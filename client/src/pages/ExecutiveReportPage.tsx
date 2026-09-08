import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useAnalytics } from '../context/AnalyticsContext';
import { MetricStatusBadge } from '../components/ui/Badge';
import { Printer, Download, Share2, ShieldCheck, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ExecutiveReportPage: React.FC = () => {
  const { report, loadingAnalytics } = useAnalytics();

  if (loadingAnalytics || !report) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96 text-slate-400">
          Generating Executive Consultant Report...
        </div>
      </PageContainer>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto space-y-8 print:p-0">
        {/* Print / Export Action Bar */}
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Executive Strategic Marketing Report</h1>
            <p className="text-sm text-slate-400 mt-1">McKinsey-style diagnostic generated on {new Date(report.generatedAt).toLocaleDateString()}</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>

        {/* Executive Report Document Container */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-slate-800 space-y-10 print:bg-white print:text-black print:border-none print:shadow-none">
          {/* Section 1: Header & Executive Summary */}
          <div className="border-b border-slate-800 pb-8 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-extrabold rounded-full uppercase tracking-wider">
                  CONFIDENTIAL STRATEGIC REPORT
                </span>
                <h2 className="text-3xl font-extrabold text-slate-100 mt-3">{report.companyName}</h2>
                <div className="text-xs text-slate-400 mt-1">{report.companyOverview}</div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>Version: <span className="text-slate-300 font-semibold">{report.version}.0</span></div>
                <div>Generated: {new Date(report.generatedAt).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">1. Executive Summary</h3>
              <p className="text-sm text-slate-200 leading-relaxed">{report.executiveSummary}</p>
            </div>
          </div>

          {/* Section 2: Health & Readiness Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">2. Business Health Score</h3>
              <div className="text-4xl font-extrabold text-indigo-400">{report.businessHealth.score} <span className="text-sm text-slate-500">/ 100</span></div>
              <div className="text-xs text-slate-400">Confidence Rating: {Math.round(report.businessHealth.confidence * 100)}%</div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">3. Marketing Readiness</h3>
              <div className="text-4xl font-extrabold text-purple-400">{report.marketingReadiness.score} <span className="text-sm text-slate-500">/ 100</span></div>
              <div className="text-xs text-slate-400">{report.marketingReadiness.positiveFactors.length} Positive Diagnostic Signals</div>
            </div>
          </div>

          {/* Section 4: Dynamic SWOT */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">4. Dynamic SWOT Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.swot.map(item => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-indigo-400 uppercase">{item.category}</span>
                    <span className="text-[10px] font-semibold text-slate-400">{item.impact} IMPACT</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100">{item.title}</div>
                  <p className="text-xs text-slate-300">{item.explanation}</p>
                  <div className="text-[10px] text-slate-500 pt-1">Evidence: {item.evidence}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Personas */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">5. Customer Persona Diagnostic</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.personas.map(p => (
                <div key={p.id} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-base font-bold text-indigo-300">{p.name}</div>
                    {p.isHypothesis && <span className="px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-semibold">AI HYPOTHESIS</span>}
                  </div>
                  <div className="text-xs text-slate-400">Role: <strong className="text-slate-200">{p.role}</strong></div>
                  <div className="text-xs text-slate-400">Demographics: <strong className="text-slate-200">{p.ageRange}</strong></div>
                  <div className="text-xs text-slate-400">Key Pain Points: <strong className="text-slate-200">{p.painPoints.join(', ')}</strong></div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Budget Allocation */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">6. 100% Budget Allocation Strategy</h3>
            <p className="text-xs text-slate-400">{report.budgetAllocation.rationale}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {report.budgetAllocation.items.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="text-xs font-semibold text-slate-400">{item.category}</div>
                  <div className="text-xl font-bold text-slate-100">{report.budgetAllocation.currency}{item.amount.toLocaleString()}</div>
                  <div className="text-xs font-bold text-indigo-400">{item.percentage}% Allocation</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: 30/60/90 Action Plan */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">7. 30 / 60 / 90 Day Action Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.actionPlan.map((plan, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="px-2.5 py-0.5 text-xs font-extrabold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{plan.timeframePhase}</span>
                  <div className="text-sm font-bold text-slate-100 mt-2">{plan.title}</div>
                  <p className="text-xs text-slate-300">{plan.description}</p>
                  <div className="text-[11px] text-emerald-400 font-semibold pt-2">Impact: {plan.expectedImpact}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
