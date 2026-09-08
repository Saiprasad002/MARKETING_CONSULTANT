import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useAnalytics } from '../context/AnalyticsContext';
import { Recommendation } from '@shared/types';
import { Sparkles, CheckCircle2, Clock, PauseCircle, CheckSquare, ShieldCheck, DollarSign, Calendar } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { report, updateRecommendationStatus } = useAnalytics();

  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const recommendations = report?.recommendations || [];

  const filtered = recommendations.filter(r => {
    if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  const handleStatusChange = async (id: string, status: string) => {
    await updateRecommendationStatus(id, status);
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Strategic Recommendations Engine</h1>
          <p className="text-sm text-slate-400 mt-1">
            Prioritized McKinsey-style action items generated from your company profile and verified metrics.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">Priority:</span>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  priorityFilter === p ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">Status:</span>
            {['ALL', 'Pending', 'In Progress', 'Completed', 'Deferred'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendation Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800 text-slate-500 text-sm">
              No recommendations match the selected filters.
            </div>
          ) : (
            filtered.map(rec => (
              <div key={rec.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${
                      rec.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {rec.priority} PRIORITY
                    </span>
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{rec.category}</span>
                  </div>

                  {/* Status Dropdown / Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {['Pending', 'In Progress', 'Completed', 'Deferred'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(rec.id, st)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                          rec.status === st
                            ? st === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-100">{rec.title}</h3>
                  <p className="text-sm text-slate-300">{rec.description}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                  <span className="font-semibold text-indigo-300">Strategic Rationale: </span>
                  <span>{rec.rationale}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Impact: <strong className="text-slate-200">{rec.expectedImpact}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Est Cost: <strong className="text-slate-200">{rec.estimatedCost}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>Timeframe: <strong className="text-slate-200">{rec.timeframe}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Confidence: <strong className="text-slate-200">{Math.round(rec.confidence * 100)}%</strong></span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
};
