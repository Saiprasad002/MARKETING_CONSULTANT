import React, { useState, useEffect, useRef } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { api } from '../services/api';
import { useCompany } from '../context/CompanyContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { ChatMessage } from '@shared/types';
import { MetricStatusBadge } from '../components/ui/Badge';
import { 
  Bot, User, Send, RefreshCw, Sparkles, CheckCircle2, AlertTriangle, RotateCcw, 
  HelpCircle, BarChart2, ShieldCheck, Activity, Target, Users, TrendingUp 
} from 'lucide-react';

export const AIConsultantPage: React.FC = () => {
  const { profile, fetchProfile } = useCompany();
  const { report, recalculate } = useAnalytics();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastExtracted, setLastExtracted] = useState<Record<string, any> | null>(null);

  const [rightTab, setRightTab] = useState<'attributes' | 'overview' | 'kpis' | 'swot' | 'personas' | 'channels' | 'recommendations'>('attributes');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadHistory = async () => {
    try {
      const res = await api.getChatMessages();
      setMessages(res.messages || []);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, errorMsg]);

  const handleSend = async (e?: React.FormEvent, retryText?: string) => {
    if (e) e.preventDefault();
    const textToSend = retryText || inputText;
    if (!textToSend.trim() || loading) return;

    if (!retryText) setInputText('');
    setErrorMsg(null);
    setLoading(true);

    const tempUserMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.sendChatMessage(textToSend);
      if (res.aiMessage) {
        setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), res.userMessage, res.aiMessage]);
      }
      if (res.extractedEntities) {
        setLastExtracted(res.extractedEntities);
      }
      await fetchProfile();
      await recalculate();
    } catch (err: any) {
      console.error('AI Consultant chat error:', err);
      setErrorMsg(err.message || 'Unable to connect to the AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset consultation history?')) {
      await api.resetChat();
      setLastExtracted(null);
      setErrorMsg(null);
      loadHistory();
    }
  };

  const sampleQuestions = [
    "What marketing strategy do you recommend for my company?",
    "How can I reduce my Customer Acquisition Cost (CAC)?",
    "What are my company's biggest strengths and weaknesses?",
    "Which marketing channels should I prioritize for maximum ROI?",
    "Give me a targeted campaign idea for college students."
  ];

  const companyName = profile?.identity?.name?.value || 'Your Company';

  return (
    <PageContainer>
      <div className="h-[calc(100vh-7rem)] grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Conversation Assistant (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">AI Marketing Consultant</h2>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 inline" />
                  <span>Personalized for {companyName}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors text-xs font-semibold flex items-center space-x-1"
              title="Reset Conversation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 && !errorMsg && (
              <div className="text-center py-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-200">How can I help with {companyName}'s growth strategy?</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    I automatically use your saved company profile, calculated KPIs, and market data to give personalized, evidence-backed recommendations.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 pt-2 max-w-lg mx-auto">
                  {sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(undefined, q)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-950/60 text-indigo-300 text-xs rounded-lg border border-slate-800 hover:border-indigo-500/50 transition-colors text-left"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => {
              const isAi = msg.sender === 'ai';
              return (
                <div key={msg.id} className={`flex space-x-3 ${isAi ? '' : 'flex-row-reverse space-x-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isAi ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  }`}>
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-xl space-y-1 ${isAi ? 'items-start' : 'items-end'}`}>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      isAi
                        ? 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-md'
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    }`}>
                      {msg.content}
                    </div>

                    <div className="text-[10px] text-slate-500 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 text-sm flex items-center space-x-2">
                  <span>Consultant is evaluating your company metrics and generating strategic guidance...</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm space-y-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
                {messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
                  <button
                    onClick={() => handleSend(undefined, messages[messages.length - 1].content)}
                    className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Request</span>
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center space-x-3">
            <input
              type="text"
              placeholder={`Ask a marketing or analytics question for ${companyName}...`}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* RIGHT PANEL: Live Interactive Context & Analytics (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          {/* Panel Tabs */}
          <div className="p-2 border-b border-slate-800 bg-slate-900/80 flex space-x-1 overflow-x-auto">
            {[
              { id: 'attributes', label: 'Attributes' },
              { id: 'overview', label: 'Overview' },
              { id: 'kpis', label: 'KPIs' },
              { id: 'swot', label: 'SWOT' },
              { id: 'personas', label: 'Personas' },
              { id: 'channels', label: 'Channels' },
              { id: 'recommendations', label: 'Strategy' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setRightTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  rightTab === t.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Views */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {rightTab === 'attributes' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-2">
                  <Sparkles className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Saved Company Context</h3>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400">Company Name</div>
                    <div className="text-xs font-bold text-slate-100">{profile?.identity?.name?.value || 'Not set'}</div>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400">Industry</div>
                    <div className="text-xs font-bold text-slate-100">{profile?.identity?.industry?.value || 'Not set'}</div>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400">Business Model</div>
                    <div className="text-xs font-bold text-slate-100">{profile?.identity?.businessType?.value || 'Not set'}</div>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400">Monthly Budget</div>
                    <div className="text-xs font-bold text-slate-100">
                      {profile?.marketing?.monthlyBudget?.value ? `${profile.marketing.currency?.value || '₹'}${profile.marketing.monthlyBudget.value}` : 'Not set'}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400">Primary Objective</div>
                    <div className="text-xs font-bold text-slate-100">{profile?.goals?.primaryGoal?.value || 'Not set'}</div>
                  </div>
                </div>

                {lastExtracted && Object.keys(lastExtracted).length > 0 && (
                  <div className="pt-2 space-y-2 border-t border-slate-800">
                    <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Recently Extracted From Chat</div>
                    {Object.entries(lastExtracted).map(([k, v]) => (
                      v ? (
                        <div key={k} className="p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-lg space-y-0.5">
                          <div className="text-[10px] font-semibold text-emerald-300 capitalize">{k}</div>
                          <div className="text-xs font-semibold text-slate-100 flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                          </div>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            )}

            {rightTab === 'overview' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Business Health Score</div>
                  <div className="text-3xl font-extrabold text-slate-100">{report?.businessHealth?.score ?? 0}/100</div>
                  <p className="text-xs text-slate-400">Calculated from verified clarity across 7 business dimensions.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Marketing Readiness</div>
                  <div className="text-3xl font-extrabold text-slate-100">{report?.marketingReadiness?.score ?? 0}/100</div>
                  <p className="text-xs text-slate-400">Audience clarity, positioning definition, and metric tracking baseline.</p>
                </div>
              </div>
            )}

            {rightTab === 'kpis' && (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Customer Acquisition Cost (CAC)</span>
                    <MetricStatusBadge status={report?.kpiAnalysis?.cac?.status || 'INSUFFICIENT_DATA'} />
                  </div>
                  <div className="text-lg font-bold text-slate-100">{report?.kpiAnalysis?.cac?.value || 'Insufficient data to calculate'}</div>
                </div>

                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Return on Ad Spend (ROAS)</span>
                    <MetricStatusBadge status={report?.kpiAnalysis?.roas?.status || 'INSUFFICIENT_DATA'} />
                  </div>
                  <div className="text-lg font-bold text-slate-100">{report?.kpiAnalysis?.roas?.value || 'Insufficient data to calculate'}</div>
                </div>

                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Monthly Revenue</span>
                    <MetricStatusBadge status={report?.kpiAnalysis?.revenue?.status || 'INSUFFICIENT_DATA'} />
                  </div>
                  <div className="text-lg font-bold text-slate-100">{report?.kpiAnalysis?.revenue?.value || 'Insufficient data to calculate'}</div>
                </div>
              </div>
            )}

            {rightTab === 'swot' && (
              <div className="space-y-3">
                {report?.swot && report.swot.length > 0 ? (
                  report.swot.map(s => (
                    <div key={s.id} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-200">{s.title}</span>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{s.category}</span>
                      </div>
                      <p className="text-xs text-slate-400">{s.explanation}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-6 text-center">Add more company details to generate SWOT analysis.</div>
                )}
              </div>
            )}

            {rightTab === 'personas' && (
              <div className="space-y-3">
                {report?.personas && report.personas.length > 0 ? (
                  report.personas.map(p => (
                    <div key={p.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                      <div className="text-sm font-bold text-indigo-300">{p.name}</div>
                      <div className="text-xs text-slate-400">Role: <span className="text-slate-200">{p.role}</span></div>
                      <div className="text-xs text-slate-400">Pain Points: <span className="text-slate-200">{p.painPoints.join(', ')}</span></div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-6 text-center">No personas defined yet.</div>
                )}
              </div>
            )}

            {rightTab === 'channels' && (
              <div className="space-y-3">
                {report?.channelAnalysis && report.channelAnalysis.length > 0 ? (
                  report.channelAnalysis.map((c, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-100">{c.channel}</span>
                        <span className="text-xs font-bold text-indigo-400">{c.fitScore}/100</span>
                      </div>
                      <p className="text-xs text-slate-400">{c.reason}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-6 text-center">Add active channels in profile to view channel fit analysis.</div>
                )}
              </div>
            )}

            {rightTab === 'recommendations' && (
              <div className="space-y-3">
                {report?.recommendations && report.recommendations.length > 0 ? (
                  report.recommendations.map(r => (
                    <div key={r.id} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                      <div className="text-xs font-bold text-indigo-300">{r.title}</div>
                      <p className="text-xs text-slate-400">{r.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-6 text-center">Complete company profile to generate strategy recommendations.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
