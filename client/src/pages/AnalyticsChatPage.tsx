import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { api } from '../services/api';
import { useAnalytics } from '../context/AnalyticsContext';
import { MetricStatusBadge } from '../components/ui/Badge';
import { 
  Bot, User, Send, Sparkles, CheckCircle2, ShieldCheck, Activity, Target, HelpCircle, AlertTriangle, RotateCcw 
} from 'lucide-react';

export const AnalyticsChatPage: React.FC = () => {
  const { report } = useAnalytics();

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [rightTab, setRightTab] = useState<'overview' | 'kpis' | 'swot' | 'customers' | 'channels' | 'recommendations'>('overview');

  const handleAsk = async (e?: React.FormEvent, retryQ?: string) => {
    if (e) e.preventDefault();
    const qToSend = retryQ || question;
    if (!qToSend.trim() || loading) return;

    if (!retryQ) setQuestion('');
    setErrorMsg(null);
    setLoading(true);

    const userMsg = { sender: 'user', content: qToSend };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await api.askAnalyticsBot(qToSend);
      if (res.auditableAnswer) {
        const aiMsg = { sender: 'ai', auditableAnswer: res.auditableAnswer };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err: any) {
      console.error('Analytics ask error:', err);
      setErrorMsg(err.message || 'Unable to connect to the AI service.');
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "What is my CAC?",
    "Why is my marketing readiness score low?",
    "What should I spend my marketing budget on?",
    "What are my biggest weaknesses?",
    "Which channel should I prioritize?"
  ];

  return (
    <PageContainer>
      <div className="h-[calc(100vh-7rem)] grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Conversation Assistant (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          {/* Top Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">AI Analytics Assistant</h2>
              <p className="text-[11px] text-slate-400">Auditable, evidence-backed answers from real company data</p>
            </div>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 && !errorMsg && (
              <div className="text-center py-12 space-y-4">
                <HelpCircle className="w-10 h-10 text-indigo-400 mx-auto opacity-80" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-200">How can I help with your marketing strategy?</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Ask questions about your budget, KPIs, SWOT, or acquisition strategy. Answers cite verified company facts.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 pt-2 max-w-lg mx-auto">
                  {sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuestion(q)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 text-xs rounded-lg border border-slate-800 transition-colors"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, idx) => {
              const isUser = m.sender === 'user';
              const ans = m.auditableAnswer;

              return (
                <div key={idx} className={`flex space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isUser ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className="max-w-xl space-y-2">
                    {isUser ? (
                      <div className="p-4 rounded-2xl bg-indigo-600 text-white text-sm">
                        {m.content}
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-sm text-slate-200">
                        <div>{ans?.answer}</div>

                        {ans?.calculations && ans.calculations.length > 0 && (
                          <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 space-y-1">
                            <div className="text-[11px] font-bold text-indigo-300 uppercase">Calculation Steps:</div>
                            {ans.calculations.map((c: string, cIdx: number) => (
                              <div key={cIdx} className="text-xs font-mono text-indigo-200">{c}</div>
                            ))}
                          </div>
                        )}

                        {ans?.facts && ans.facts.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-[11px] font-bold text-slate-400 uppercase">Verified Facts Used:</div>
                            <div className="flex flex-wrap gap-1.5">
                              {ans.facts.map((f: string, fIdx: number) => (
                                <span key={fIdx} className="px-2 py-0.5 text-[11px] rounded bg-slate-800 text-slate-300 border border-slate-700">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 text-sm">
                  Thinking...
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
                    onClick={() => handleAsk(undefined, messages[messages.length - 1].content)}
                    className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Request</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Form Input */}
          <form onSubmit={handleAsk} className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center space-x-3">
            <input
              type="text"
              placeholder="Ask any analytics or strategy question..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!question.trim() || loading}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* RIGHT PANEL: Live Interactive Analytics Panel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          {/* Panel Tabs */}
          <div className="p-2 border-b border-slate-800 bg-slate-900/80 flex space-x-1 overflow-x-auto">
            {['overview', 'kpis', 'swot', 'customers', 'channels', 'recommendations'].map(tab => (
              <button
                key={tab}
                onClick={() => setRightTab(tab as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  rightTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Views */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {rightTab === 'overview' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-indigo-400">Business Health Score</div>
                  <div className="text-3xl font-extrabold text-slate-100">{report?.businessHealth.score}/100</div>
                  <p className="text-xs text-slate-400">Calculated from verified clarity across 7 dimensions.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-purple-400">Marketing Readiness</div>
                  <div className="text-3xl font-extrabold text-slate-100">{report?.marketingReadiness.score}/100</div>
                  <p className="text-xs text-slate-400">Audience, positioning, and metric tracking baseline.</p>
                </div>
              </div>
            )}

            {rightTab === 'kpis' && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>CAC</span>
                    <MetricStatusBadge status={report?.kpiAnalysis?.cac?.status || 'INSUFFICIENT_DATA'} />
                  </div>
                  <div className="text-lg font-bold text-slate-100">{report?.kpiAnalysis?.cac?.value || 'Insufficient data'}</div>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>ROAS</span>
                    <MetricStatusBadge status={report?.kpiAnalysis?.roas?.status || 'INSUFFICIENT_DATA'} />
                  </div>
                  <div className="text-lg font-bold text-slate-100">{report?.kpiAnalysis?.roas?.value || 'Insufficient data'}</div>
                </div>
              </div>
            )}

            {rightTab === 'swot' && (
              <div className="space-y-3">
                {report?.swot?.map(s => (
                  <div key={s.id} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-200">{s.title}</span>
                      <span className="text-[10px] font-semibold text-indigo-400 uppercase">{s.category}</span>
                    </div>
                    <p className="text-xs text-slate-400">{s.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {rightTab === 'customers' && (
              <div className="space-y-3">
                {report?.personas?.map(p => (
                  <div key={p.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                    <div className="text-sm font-bold text-indigo-300">{p.name}</div>
                    <div className="text-xs text-slate-400">Role: {p.role}</div>
                    <div className="text-xs text-slate-400">Pain Points: {p.painPoints.join(', ')}</div>
                  </div>
                ))}
              </div>
            )}

            {rightTab === 'channels' && (
              <div className="space-y-3">
                {report?.channelAnalysis?.map((c, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-100">{c.channel}</span>
                      <span className="text-xs font-bold text-indigo-400">{c.fitScore}/100</span>
                    </div>
                    <p className="text-xs text-slate-400">{c.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {rightTab === 'recommendations' && (
              <div className="space-y-3">
                {report?.recommendations?.map(r => (
                  <div key={r.id} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-indigo-300">{r.title}</div>
                    <p className="text-xs text-slate-400">{r.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
