import React, { useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building, Target, Users, BarChart2, Award, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { updateBatch } = useCompany();
  const { recalculate } = useAnalytics();
  const { markOnboardingCompleted } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    identity: {
      name: '',
      website: '',
      industry: '',
      businessType: 'B2B',
      startupStage: 'Early Stage',
      location: '',
      employeesCount: '1-10'
    },
    businessDescription: {
      description: '',
      productsServices: '',
      usp: '',
      businessModel: '',
      pricingModel: ''
    },
    targetCustomer: {
      idealCustomer: '',
      demographics: '',
      geography: '',
      painPoints: '',
      motivations: ''
    },
    competition: {
      competitors: '',
      competitiveAdvantages: '',
      marketPosition: ''
    },
    marketing: {
      currentChannels: '',
      monthlyBudget: '',
      currency: '₹',
      currentCac: '',
      currentRoas: '',
      conversionRate: '',
      monthlyRevenue: ''
    },
    goals: {
      primaryGoal: 'Increase Sales',
      growthTargets: ''
    }
  });

  const updateSection = (section: string, key: string, val: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [key]: val
      }
    }));
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const formatted = {
        identity: {
          name: formData.identity.name,
          website: formData.identity.website,
          industry: formData.identity.industry,
          businessType: formData.identity.businessType,
          startupStage: formData.identity.startupStage,
          location: formData.identity.location,
          employeesCount: formData.identity.employeesCount
        },
        businessDescription: {
          description: formData.businessDescription.description,
          productsServices: formData.businessDescription.productsServices ? formData.businessDescription.productsServices.split(',').map(s => s.trim()) : [],
          usp: formData.businessDescription.usp,
          businessModel: formData.businessDescription.businessModel,
          pricingModel: formData.businessDescription.pricingModel
        },
        targetCustomer: {
          idealCustomer: formData.targetCustomer.idealCustomer,
          demographics: formData.targetCustomer.demographics,
          geography: formData.targetCustomer.geography,
          painPoints: formData.targetCustomer.painPoints ? formData.targetCustomer.painPoints.split(',').map(s => s.trim()) : [],
          motivations: formData.targetCustomer.motivations ? formData.targetCustomer.motivations.split(',').map(s => s.trim()) : []
        },
        competition: {
          competitors: formData.competition.competitors ? formData.competition.competitors.split(',').map(s => s.trim()) : [],
          competitiveAdvantages: formData.competition.competitiveAdvantages ? formData.competition.competitiveAdvantages.split(',').map(s => s.trim()) : [],
          marketPosition: formData.competition.marketPosition
        },
        marketing: {
          currentChannels: formData.marketing.currentChannels ? formData.marketing.currentChannels.split(',').map(s => s.trim()) : [],
          monthlyBudget: formData.marketing.monthlyBudget ? parseFloat(formData.marketing.monthlyBudget) : null,
          currency: formData.marketing.currency,
          currentCac: formData.marketing.currentCac ? parseFloat(formData.marketing.currentCac) : null,
          currentRoas: formData.marketing.currentRoas ? parseFloat(formData.marketing.currentRoas) : null,
          conversionRate: formData.marketing.conversionRate ? parseFloat(formData.marketing.conversionRate) : null,
          monthlyRevenue: formData.marketing.monthlyRevenue ? parseFloat(formData.marketing.monthlyRevenue) : null
        },
        goals: {
          primaryGoal: formData.goals.primaryGoal,
          growthTargets: formData.goals.growthTargets
        }
      };

      await updateBatch(formatted);
      await markOnboardingCompleted();
      await recalculate();
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    { title: 'Company Identity', icon: Building },
    { title: 'Products & USP', icon: Sparkles },
    { title: 'Target Customer', icon: Users },
    { title: 'Competition', icon: Target },
    { title: 'Marketing & Metrics', icon: BarChart2 },
    { title: 'Growth Goals', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl space-y-8">
        {/* Step Indicator */}
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-100">Let's build your company profile</h1>
            <p className="text-sm text-slate-400">Step {step} of 6 — {stepsList[step - 1].title}</p>
          </div>

          <div className="flex items-center justify-between">
            {stepsList.map((s, idx) => {
              const isDone = step > idx + 1;
              const isCurrent = step === idx + 1;
              return (
                <div key={idx} className="flex-1 flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone ? 'bg-emerald-500 text-slate-950' : isCurrent ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  {idx < 5 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full ${step > idx + 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Form Card */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-100">Company Identity</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Company Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. EcoWear Apparel"
                    value={formData.identity.name}
                    onChange={e => updateSection('identity', 'name', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Website URL</label>
                  <input
                    type="text"
                    placeholder="https://ecowear.com"
                    value={formData.identity.website}
                    onChange={e => updateSection('identity', 'website', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Industry *</label>
                  <input
                    type="text"
                    placeholder="e.g. Fashion / Ecommerce / SaaS"
                    value={formData.identity.industry}
                    onChange={e => updateSection('identity', 'industry', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Business Model</label>
                  <select
                    value={formData.identity.businessType}
                    onChange={e => updateSection('identity', 'businessType', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="B2B">B2B (Business to Business)</option>
                    <option value="B2C">B2C (Business to Consumer)</option>
                    <option value="D2C">D2C (Direct to Consumer)</option>
                    <option value="SaaS">SaaS (Software as a Service)</option>
                    <option value="Services">Professional Services</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Startup Stage</label>
                  <select
                    value={formData.identity.startupStage}
                    onChange={e => updateSection('identity', 'startupStage', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Idea">Idea / Pre-launch</option>
                    <option value="Early Stage">Early Stage / Seed</option>
                    <option value="Growth">Growth Stage</option>
                    <option value="Established">Established Enterprise</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-100">Products & Value Proposition</h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Company Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what your company does, your main offerings, and core mission..."
                    value={formData.businessDescription.description}
                    onChange={e => updateSection('businessDescription', 'description', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Products / Services (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Sustainable T-Shirts, Organic Jackets, Linen Pants"
                    value={formData.businessDescription.productsServices}
                    onChange={e => updateSection('businessDescription', 'productsServices', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Unique Selling Proposition (USP)</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% recycled organic fabrics with lifetime repair guarantee"
                    value={formData.businessDescription.usp}
                    onChange={e => updateSection('businessDescription', 'usp', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-100">Target Customer</h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Ideal Customer Persona</label>
                  <input
                    type="text"
                    placeholder="e.g. Environmentally conscious millennial urban professionals"
                    value={formData.targetCustomer.idealCustomer}
                    onChange={e => updateSection('targetCustomer', 'idealCustomer', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Demographics</label>
                    <input
                      type="text"
                      placeholder="Age 25-40, College Educated"
                      value={formData.targetCustomer.demographics}
                      onChange={e => updateSection('targetCustomer', 'demographics', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Geography</label>
                    <input
                      type="text"
                      placeholder="India / Tier 1 Metros / Global"
                      value={formData.targetCustomer.geography}
                      onChange={e => updateSection('targetCustomer', 'geography', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Customer Pain Points (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Fast fashion waste, low fabric quality, non-transparent pricing"
                    value={formData.targetCustomer.painPoints}
                    onChange={e => updateSection('targetCustomer', 'painPoints', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-100">Competition</h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Direct Competitors (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Competitor A, Competitor B, Competitor C"
                    value={formData.competition.competitors}
                    onChange={e => updateSection('competition', 'competitors', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Competitive Advantages (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Lower pricing, faster shipping, carbon-neutral manufacturing"
                    value={formData.competition.competitiveAdvantages}
                    onChange={e => updateSection('competition', 'competitiveAdvantages', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-100">Marketing & Performance Metrics</h2>
              <p className="text-xs text-slate-400">Leave any unmeasured metric blank — the system will explicitly report missing data rather than guessing.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Active Marketing Channels (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Google Ads, Meta Ads, SEO, Influencer Marketing"
                    value={formData.marketing.currentChannels}
                    onChange={e => updateSection('marketing', 'currentChannels', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Monthly Marketing Budget</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-800 bg-slate-800 text-slate-300 text-sm">{formData.marketing.currency}</span>
                    <input
                      type="number"
                      placeholder="150000"
                      value={formData.marketing.monthlyBudget}
                      onChange={e => updateSection('marketing', 'monthlyBudget', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-r-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Monthly Revenue</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-800 bg-slate-800 text-slate-300 text-sm">{formData.marketing.currency}</span>
                    <input
                      type="number"
                      placeholder="500000"
                      value={formData.marketing.monthlyRevenue}
                      onChange={e => updateSection('marketing', 'monthlyRevenue', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-r-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Historical CAC ({formData.marketing.currency})</label>
                  <input
                    type="number"
                    placeholder="Leave blank if unknown"
                    value={formData.marketing.currentCac}
                    onChange={e => updateSection('marketing', 'currentCac', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Conversion Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 2.5"
                    value={formData.marketing.conversionRate}
                    onChange={e => updateSection('marketing', 'conversionRate', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-100">Growth Goals</h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Primary Objective</label>
                  <select
                    value={formData.goals.primaryGoal}
                    onChange={e => updateSection('goals', 'primaryGoal', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Increase sales">Increase Direct Sales</option>
                    <option value="Lead generation">Lead Generation & Pipeline</option>
                    <option value="Brand awareness">Brand Awareness & Market Reach</option>
                    <option value="Reduce CAC">Reduce Customer Acquisition Cost (CAC)</option>
                    <option value="Increase ROAS">Maximize ROAS & Profitability</option>
                    <option value="Improve retention">Improve Customer Retention & Repeat Purchase</option>
                    <option value="Expand into new markets">Expand into New Regional Markets</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Target Growth Targets</label>
                  <input
                    type="text"
                    placeholder="e.g. 3x revenue expansion within 6 months"
                    value={formData.goals.growthTargets}
                    onChange={e => updateSection('goals', 'growthTargets', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg flex items-center space-x-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            ) : <div />}

            {step < 6 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg flex items-center space-x-2 transition-colors shadow-lg shadow-indigo-500/25"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-lg flex items-center space-x-2 transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                <span>{submitting ? 'Calculating Profile...' : 'Complete Setup & Launch Dashboard'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
