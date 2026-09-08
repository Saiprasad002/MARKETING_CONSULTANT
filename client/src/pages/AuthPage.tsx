import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, User, Building } from 'lucide-react';

export const AuthPage: React.FC<{ initialMode?: 'signup' | 'signin' }> = ({ initialMode = 'signup' }) => {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(initialMode === 'signup');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to home/dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isRegister) {
        await register({ email, password, name, companyName });
      } else {
        await login({ email, password });
      }
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Header Branding */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">AI Marketing Consultant</h1>
          <p className="text-slate-400 text-sm">
            Zero-hallucination, data-backed marketing intelligence platform
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-slate-800 space-y-6">
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
                !isRegister ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
                isRegister ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Your Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Company Name</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="Acme Innovations"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="jane@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-2"
            >
              <span>{submitting ? 'Authenticating...' : isRegister ? 'Create Workspace' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
