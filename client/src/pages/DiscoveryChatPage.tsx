import React, { useState, useEffect, useRef } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { api } from '../services/api';
import { useCompany } from '../context/CompanyContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { ChatMessage } from '@shared/types';
import { Bot, User, Send, RefreshCw, Sparkles, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

export const DiscoveryChatPage: React.FC = () => {
  const { fetchProfile } = useCompany();
  const { recalculate } = useAnalytics();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastExtracted, setLastExtracted] = useState<Record<string, any> | null>(null);

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
      console.error('Chat error:', err);
      setErrorMsg(err.message || 'Unable to connect to the AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset conversation history?')) {
      await api.resetChat();
      setLastExtracted(null);
      setErrorMsg(null);
      loadHistory();
    }
  };

  return (
    <PageContainer>
      <div className="h-[calc(100vh-7rem)] flex gap-6">
        {/* Left: Chat Conversation */}
        <div className="flex-1 flex flex-col glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">Senior AI Marketing Consultant</h2>
                <p className="text-[11px] text-emerald-400 font-semibold">Real AI Service Connected</p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors text-xs font-semibold flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 && !errorMsg && (
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 text-sm">
                How can I help with your marketing strategy? Tell me about your company, target audience, budget, or acquisition channels.
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
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isAi
                        ? 'bg-slate-900/80 border border-slate-800 text-slate-200'
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
                  <span>Thinking...</span>
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
              placeholder="Type your company details, target audience, budget, or goals..."
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

        {/* Right Drawer: Live Entity Extraction Stream */}
        <div className="w-80 glass-panel rounded-2xl border border-slate-800 p-5 space-y-4 hidden xl:flex flex-col">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Extracted Attributes</h3>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {lastExtracted && Object.keys(lastExtracted).length > 0 ? (
              Object.entries(lastExtracted).map(([k, v]) => (
                v ? (
                  <div key={k} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400 capitalize">{k}</div>
                    <div className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                    </div>
                  </div>
                ) : null
              ))
            ) : (
              <div className="text-xs text-slate-500 text-center py-10">
                As you chat, extracted facts (budget, channels, goals, industry) will automatically stream here.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
