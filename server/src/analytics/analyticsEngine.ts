import { 
  SWOTItem, 
  CustomerPersona, 
  MarketPositioning, 
  ChannelAnalysis, 
  BudgetAllocation, 
  FunnelStage, 
  CustomerJourneyPhase, 
  Recommendation, 
  ActionPlanItem, 
  ExecutiveReport 
} from '../../../shared/types';

import { calculateBusinessHealthScore } from './healthScore';
import { calculateMarketingReadinessScore } from './readinessScore';
import { evaluateGrowthPotential } from './growthPotential';
export { evaluateGrowthPotential };
import { calculateKPIs } from './kpiEngine';
import { generateId } from '../utils/id';

export function generateDynamicSWOT(profile: Record<string, any>): SWOTItem[] {
  const items: SWOTItem[] = [];

  const companyName = profile.identity?.name?.value || 'Company';
  const usp = profile.businessDescription?.usp?.value;
  const products = profile.businessDescription?.productsServices?.value;
  const budget = profile.marketing?.monthlyBudget?.value;
  const competitors = profile.competition?.competitors?.value;
  const cac = profile.marketing?.currentCac?.value;
  const revenue = profile.marketing?.monthlyRevenue?.value;

  // Strengths
  if (usp) {
    items.push({
      id: generateId(),
      category: 'STRENGTH',
      title: 'Clear Value Proposition',
      explanation: `Documented differentiation: "${usp}"`,
      evidence: `User provided unique selling proposition in profile`,
      impact: 'HIGH',
      confidence: 1.0,
      source: profile.businessDescription?.usp?.source
    });
  }
  if (revenue && revenue > 0) {
    items.push({
      id: generateId(),
      category: 'STRENGTH',
      title: 'Established Sales Revenue',
      explanation: `Active monthly revenue generation of ${profile.marketing?.currency?.value || '₹'}${revenue.toLocaleString()}`,
      evidence: `Historical company revenue metric provided`,
      impact: 'HIGH',
      confidence: 1.0
    });
  }

  // Weaknesses
  if (!budget || budget === 0) {
    items.push({
      id: generateId(),
      category: 'WEAKNESS',
      title: 'Unallocated Marketing Spend',
      explanation: 'No confirmed monthly marketing budget is allocated for active customer acquisition.',
      evidence: 'Monthly budget field is empty or set to zero',
      impact: 'HIGH',
      confidence: 1.0
    });
  }

  if (!cac) {
    items.push({
      id: generateId(),
      category: 'WEAKNESS',
      title: 'Unmeasured Customer Acquisition Cost (CAC)',
      explanation: 'Historical customer acquisition cost has not been tracked or supplied.',
      evidence: 'CAC metric field missing in profile',
      impact: 'MEDIUM',
      confidence: 1.0
    });
  }

  // Opportunities
  if (budget && budget > 0) {
    items.push({
      id: generateId(),
      category: 'OPPORTUNITY',
      title: 'Paid Acquisition Scaling',
      explanation: `Deploy dedicated monthly capital of ${profile.marketing?.currency?.value || '₹'}${budget.toLocaleString()} to scale high-intent channels.`,
      evidence: `Active capital commitment provided by company`,
      impact: 'HIGH',
      confidence: 0.9
    });
  }

  items.push({
    id: generateId(),
    category: 'OPPORTUNITY',
    title: 'Funnel Optimization',
    explanation: 'Systematic conversion rate optimization and retargeting setup across primary customer touchpoints.',
    evidence: 'Inferred from digital channel requirements',
    impact: 'MEDIUM',
    confidence: 0.85
  });

  // Threats
  if (competitors && Array.isArray(competitors) && competitors.length > 0) {
    items.push({
      id: generateId(),
      category: 'THREAT',
      title: 'Direct Market Competition',
      explanation: `Active rival pressure from identified industry competitors: ${competitors.join(', ')}`,
      evidence: `Competitor list supplied by company`,
      impact: 'HIGH',
      confidence: 1.0
    });
  } else {
    items.push({
      id: generateId(),
      category: 'THREAT',
      title: 'Unmonitored Competitor Dynamics',
      explanation: 'Lack of explicit competitor tracking creates vulnerability to market share erosion.',
      evidence: 'No competitors identified in company profile',
      impact: 'MEDIUM',
      confidence: 0.8
    });
  }

  return items;
}

export function generateCustomerPersonas(profile: Record<string, any>): CustomerPersona[] {
  const ideal = profile.targetCustomer?.idealCustomer?.value;
  const painPoints = profile.targetCustomer?.painPoints?.value || [];
  const motivations = profile.targetCustomer?.motivations?.value || [];
  const channels = profile.marketing?.currentChannels?.value || [];
  const demographics = profile.targetCustomer?.demographics?.value;
  const geography = profile.targetCustomer?.geography?.value;

  if (!ideal && painPoints.length === 0) {
    return [
      {
        id: generateId(),
        name: 'Primary Buyer (Not Provided)',
        role: 'Target Customer',
        ageRange: 'Age: Not provided',
        incomeRange: 'Income: Not provided',
        geography: geography || 'Geography: Not provided',
        painPoints: ['Pain points not provided yet'],
        motivations: ['Motivations not provided yet'],
        preferredChannels: ['Channels not provided yet'],
        buyingBehavior: 'Behavior details pending customer input',
        purchaseTriggers: ['Trigger details pending input'],
        objections: ['Objection details pending input'],
        isHypothesis: true
      }
    ];
  }

  return [
    {
      id: generateId(),
      name: ideal || 'Target Decision Maker',
      role: profile.identity?.businessType?.value === 'B2B' ? 'Business Owner / Manager' : 'Individual Buyer',
      ageRange: demographics || 'Age range: Not explicitly provided',
      incomeRange: 'Income range: Not provided',
      geography: geography || 'Primary operating region',
      painPoints: painPoints.length > 0 ? painPoints : ['Value for money', 'Reliability'],
      motivations: motivations.length > 0 ? motivations : ['Efficiency', 'Quality assurance'],
      preferredChannels: channels.length > 0 ? channels : ['Digital Search', 'Social Media'],
      buyingBehavior: 'Evaluates options online before making a final purchase decision.',
      purchaseTriggers: ['Immediate operational need', 'Promotions or strong product differentiation'],
      objections: ['Price transparency', 'Trustworthiness of provider'],
      isHypothesis: false
    }
  ];
}

export function generatePositioning(profile: Record<string, any>): MarketPositioning {
  const usp = profile.businessDescription?.usp?.value;
  const category = profile.identity?.industry?.value || 'Industry';
  const idealCustomer = profile.targetCustomer?.idealCustomer?.value || 'target clients';

  return {
    currentPositioning: usp 
      ? `FACT: Positioned around "${usp}" in the ${category} market.` 
      : `AI HYPOTHESIS: Standard position in ${category} pending explicit USP definition.`,
    recommendedPositioning: usp 
      ? `AI RECOMMENDATION: Position as the premier data-backed provider of ${usp} tailored for ${idealCustomer}.` 
      : `AI RECOMMENDATION: Establish clear differentiation focused on quality, speed, and customer outcome.`,
    differentiation: profile.competition?.competitiveAdvantages?.value || [
      'Personalized customer support',
      'Targeted product capability'
    ],
    messagingPillars: [
      {
        pillar: 'Core Value Proposition',
        description: usp || 'Delivering high-quality product/service outcome.',
        supportingEvidence: usp ? 'Verified company USP entry' : 'Baseline hypothesis'
      },
      {
        pillar: 'Trust & Reliability',
        description: 'Consistent performance and transparent pricing model.',
        supportingEvidence: 'Provided pricing structure'
      }
    ],
    confidence: usp ? 0.95 : 0.5
  };
}

export function generateChannelAnalysis(profile: Record<string, any>): ChannelAnalysis[] {
  const currentChannels: string[] = profile.marketing?.currentChannels?.value || [];
  const currency = profile.marketing?.currency?.value || '₹';
  const existingCac = profile.marketing?.currentCac?.value;

  if (!currentChannels || currentChannels.length === 0) {
    return [];
  }

  return currentChannels.map(ch => {
    return {
      channel: ch,
      fitScore: 85,
      reason: 'Currently active acquisition channel reported by company.',
      recommendedPriority: 'HIGH',
      budgetRecommendation: 'Allocate test budget to validate ROI.',
      expectedOutcome: 'Qualified inbound customer inquiries.',
      confidence: 0.9,
      currentCpa: existingCac 
        ? { value: `${currency}${existingCac}`, status: 'AVAILABLE', source: 'user_input' }
        : { value: null, status: 'INSUFFICIENT_DATA', explanation: 'CPA unavailable — historical acquisition data required.' },
      currentRoas: profile.marketing?.currentRoas?.value 
        ? { value: `${profile.marketing.currentRoas.value}x`, status: 'AVAILABLE', source: 'user_input' }
        : { value: null, status: 'INSUFFICIENT_DATA', explanation: 'ROAS unavailable — channel spend attribution required.' }
    };
  });
}

export function generateBudgetAllocation(profile: Record<string, any>): BudgetAllocation {
  const budget = profile.marketing?.monthlyBudget?.value;
  const currency = profile.marketing?.currency?.value || '₹';

  if (!budget || budget <= 0) {
    return {
      totalBudget: 0,
      currency,
      items: [],
      confidence: 0,
      rationale: 'No monthly marketing budget provided by company.',
      status: 'INSUFFICIENT_DATA'
    };
  }

  // Allocate 100% strictly across 4 strategic buckets based on user's actual budget
  const items = [
    {
      category: 'High-Intent Paid Acquisition',
      amount: Math.round(budget * 0.45),
      percentage: 45,
      reason: 'Direct lead generation and immediate sales conversion'
    },
    {
      category: 'Content & Brand Awareness',
      amount: Math.round(budget * 0.25),
      percentage: 25,
      reason: 'Building organic search authority and trust'
    },
    {
      category: 'Retargeting & Retention',
      amount: Math.round(budget * 0.20),
      percentage: 20,
      reason: 'Maximizing repeat sales and reducing drop-off'
    },
    {
      category: 'Testing & Innovation',
      amount: Math.round(budget * 0.10),
      percentage: 10,
      reason: 'Trialing new ad creatives and experimental audience segments'
    }
  ];

  return {
    totalBudget: budget,
    currency,
    items,
    confidence: 1.0,
    rationale: `100% allocation of user's confirmed monthly marketing budget (${currency}${budget.toLocaleString()}).`,
    status: 'CALCULATED'
  };
}

export function generateFunnel(profile: Record<string, any>): FunnelStage[] {
  const convRate = profile.marketing?.conversionRate?.value;
  const traffic = profile.marketing?.websiteTraffic?.value;
  const sales = profile.marketing?.sales?.value;

  return [
    {
      stage: 'Awareness',
      tactics: ['Search Engine Optimization', 'Targeted Ad Campaigns'],
      channels: profile.marketing?.currentChannels?.value || ['Google', 'Social Media'],
      kpi: 'Monthly Impressions & Visitors',
      baseline: traffic 
        ? { value: traffic.toLocaleString(), status: 'AVAILABLE', source: 'user_input' }
        : { value: null, status: 'INSUFFICIENT_DATA', explanation: 'Current conversion baseline: Not provided' },
      target: 'Establish baseline growth trajectory',
      measurementMethod: 'Web analytics tracking'
    },
    {
      stage: 'Consideration',
      tactics: ['Product Demo Videos', 'Case Studies & Testimonials'],
      channels: ['Website Landing Pages', 'Email Newsletters'],
      kpi: 'Lead Form Submission Rate',
      baseline: { value: null, status: 'INSUFFICIENT_DATA', explanation: 'Define after baseline measurement' },
      target: 'Increase qualified lead engagement',
      measurementMethod: 'Form completion analytics'
    },
    {
      stage: 'Conversion',
      tactics: ['Limited Time Offers', 'Clear Checkout CTA'],
      channels: ['Direct Sales / Checkout'],
      kpi: 'Sales Conversion Rate',
      baseline: convRate 
        ? { value: `${convRate}%`, status: 'AVAILABLE', source: 'user_input' }
        : { value: null, status: 'INSUFFICIENT_DATA', explanation: 'Current conversion rate: Not provided' },
      target: 'Improve baseline conversion by 15-20%',
      measurementMethod: 'Payment gateway / CRM conversions'
    },
    {
      stage: 'Retention',
      tactics: ['Post-Purchase Onboarding', 'Customer Loyalty Incentives'],
      channels: ['Email Automation', 'Customer Support'],
      kpi: 'Repeat Purchase Rate',
      baseline: profile.marketing?.repeatPurchaseRate?.value 
        ? { value: `${profile.marketing.repeatPurchaseRate.value}%`, status: 'AVAILABLE', source: 'user_input' }
        : { value: null, status: 'INSUFFICIENT_DATA', explanation: 'Current repeat rate: Not provided' },
      target: 'Maximize customer lifetime value',
      measurementMethod: 'CRM retention analytics'
    }
  ];
}

export function generateCustomerJourney(profile: Record<string, any>): CustomerJourneyPhase[] {
  return [
    {
      phase: 'Discovery',
      touchpoints: ['Google Search', 'Social Ads', 'Referrals'],
      customerAction: 'Searches for solutions to key pain points.',
      companyAction: 'Delivers targeted ad copy and SEO landing pages.',
      friction: 'Unclear brand recognition.',
      opportunity: 'Present immediate solution clarity.',
      kpi: 'Click-Through Rate (CTR)'
    },
    {
      phase: 'Engagement',
      touchpoints: ['Website Homepage', 'Product Catalog'],
      customerAction: 'Explores product features and pricing details.',
      companyAction: 'Displays social proof, USP, and simple navigation.',
      friction: 'High website bounce rate if page loads slowly.',
      opportunity: 'Highlight USP upfront.',
      kpi: 'Average Time on Site'
    },
    {
      phase: 'Consideration',
      touchpoints: ['Pricing Page', 'Reviews / FAQs'],
      customerAction: 'Compares value proposition against competitors.',
      companyAction: 'Provides transparent pricing and comparison table.',
      friction: 'Uncertainty around product guarantee.',
      opportunity: 'Offer clear guarantee or demo.',
      kpi: 'Inbound Lead Forms'
    },
    {
      phase: 'Conversion',
      touchpoints: ['Checkout Page', 'Order Confirmation'],
      customerAction: 'Completes checkout payment or signs contract.',
      companyAction: 'Ensures frictionless gateway checkout.',
      friction: 'Complex form fields.',
      opportunity: 'Simplify checkout to 1-click.',
      kpi: 'Checkout Completion Rate'
    },
    {
      phase: 'Onboarding',
      touchpoints: ['Welcome Email', 'Product Usage'],
      customerAction: 'Receives order and begins using product/service.',
      companyAction: 'Sends automated onboarding instructions.',
      friction: 'Delayed product delivery or support response.',
      opportunity: 'Proactive customer service followup.',
      kpi: 'Customer Satisfaction Score'
    },
    {
      phase: 'Retention',
      touchpoints: ['Re-engagement Email', 'Promotions'],
      customerAction: 'Reorders or renews subscription service.',
      companyAction: 'Offers loyalty rewards or complementary products.',
      friction: 'Lack of post-purchase communication.',
      opportunity: 'Automate periodic retention campaigns.',
      kpi: 'Repeat Purchase Rate'
    },
    {
      phase: 'Advocacy',
      touchpoints: ['Review Request', 'Referral Link'],
      customerAction: 'Recommends company to peers.',
      companyAction: 'Provides referral incentives.',
      friction: 'Complicated referral submission.',
      opportunity: '1-click social sharing links.',
      kpi: 'Net Promoter Score (NPS)'
    }
  ];
}

export function generateRecommendations(profile: Record<string, any>): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const budget = profile.marketing?.monthlyBudget?.value;
  const usp = profile.businessDescription?.usp?.value;
  const cac = profile.marketing?.currentCac?.value;
  const goal = profile.goals?.primaryGoal?.value;

  if (!budget || budget === 0) {
    recommendations.push({
      id: generateId(),
      title: 'Set up Dedicated Monthly Marketing Budget',
      description: 'Establish a clear, predictable monthly capital allocation to run active user acquisition testing.',
      rationale: 'Absence of allocated budget blocks structured paid ad campaigns and channel optimization.',
      category: 'Budgeting & Strategy',
      priority: 'HIGH',
      expectedImpact: 'Enables consistent lead generation and baseline CAC tracking.',
      estimatedEffort: 'LOW',
      estimatedCost: 'Variable based on company strategy',
      timeframe: 'Immediate (1-7 Days)',
      requiredData: ['Financial planning budget cap'],
      supportingEvidence: 'Company profile shows empty monthly budget',
      confidence: 1.0,
      status: 'Pending'
    });
  }

  if (!usp) {
    recommendations.push({
      id: generateId(),
      title: 'Formalize Unique Selling Proposition (USP)',
      description: 'Define exact core differentiators that set your products/services apart from direct market competitors.',
      rationale: 'Unclear positioning leads to high ad fatigue and lower conversion rates across landing pages.',
      category: 'Brand Positioning',
      priority: 'HIGH',
      expectedImpact: 'Improves ad click-through rate and landing page conversion efficiency by 20-30%.',
      estimatedEffort: 'MEDIUM',
      estimatedCost: '₹0 (Internal alignment)',
      timeframe: 'Short-term (1-2 Weeks)',
      requiredData: ['Competitor feature analysis'],
      supportingEvidence: 'Profile lacks documented USP statement',
      confidence: 0.95,
      status: 'Pending'
    });
  }

  if (!cac) {
    recommendations.push({
      id: generateId(),
      title: 'Implement Full-Funnel CAC Tracking',
      description: 'Integrate conversion tracking scripts across ad platforms and website payment checkout.',
      rationale: 'Without tracking exact CAC per channel, marketing spend risk is unmanaged.',
      category: 'Analytics & Tracking',
      priority: 'HIGH',
      expectedImpact: 'Provides auditable ROAS and protects acquisition budget.',
      estimatedEffort: 'LOW',
      estimatedCost: '₹0 (Tool integration)',
      timeframe: 'Short-term (1 Week)',
      requiredData: ['Google Tag Manager access', 'Ad account pixel access'],
      supportingEvidence: 'Current CAC metric status is INSUFFICIENT_DATA',
      confidence: 1.0,
      status: 'Pending'
    });
  }

  recommendations.push({
    id: generateId(),
    title: 'Deploy High-Intent Search & Conversion Optimization',
    description: 'Structure ad campaigns around high-commercial intent search queries and optimize mobile landing page speed.',
    rationale: `Direct alignment with primary objective: ${goal || 'Business Growth'}.`,
    category: 'Acquisition Channels',
    priority: 'MEDIUM',
    expectedImpact: 'Higher lead capture rate and reduced cost per click.',
    estimatedEffort: 'MEDIUM',
    estimatedCost: budget ? `Within allocated ${profile.marketing?.currency?.value || '₹'}${budget}` : 'Requires budget cap',
    timeframe: 'Medium-term (30-60 Days)',
    requiredData: ['Keyword research data', 'Landing page analytics'],
    supportingEvidence: 'Standard high-intent acquisition best practices',
    confidence: 0.85,
    status: 'Pending'
  });

  return recommendations;
}

export function generateActionPlan(profile: Record<string, any>): ActionPlanItem[] {
  return [
    {
      timeframePhase: 'Days 1–30',
      title: 'Foundation & Measurement Setup',
      description: 'Fix data gaps, finalize USP messaging, and configure conversion tracking pixels across all acquisition channels.',
      priority: 'HIGH',
      expectedImpact: 'Establishes accurate baseline analytics and eliminates unmeasured spend.',
      kpisToTrack: ['Data Completeness %', 'Tracking Setup Status']
    },
    {
      timeframePhase: 'Days 31–60',
      title: 'Channel Optimization & Campaign Execution',
      description: 'Launch structured campaign experiments on top-fit marketing channels and refine audience targeting.',
      priority: 'HIGH',
      expectedImpact: 'Generates initial qualified inquiries and measures real-world CAC.',
      kpisToTrack: ['Monthly Leads', 'Initial CAC', 'CTR']
    },
    {
      timeframePhase: 'Days 61–90',
      title: 'Scaling & Retention Automation',
      description: 'Reallocate capital toward winning channels, initiate retargeting, and automate post-purchase email onboarding.',
      priority: 'MEDIUM',
      expectedImpact: 'Maximizes ROAS and increases customer retention rate.',
      kpisToTrack: ['ROAS', 'Repeat Purchase Rate', 'Monthly Revenue']
    }
  ];
}

export function generateExecutiveReport(profile: Record<string, any>): ExecutiveReport {
  const health = calculateBusinessHealthScore(profile);
  const readiness = calculateMarketingReadinessScore(profile);
  const growth = evaluateGrowthPotential(profile);
  const kpis = calculateKPIs(profile);
  const swot = generateDynamicSWOT(profile);
  const personas = generateCustomerPersonas(profile);
  const positioning = generatePositioning(profile);
  const channels = generateChannelAnalysis(profile);
  const budget = generateBudgetAllocation(profile);
  const funnel = generateFunnel(profile);
  const journey = generateCustomerJourney(profile);
  const recommendations = generateRecommendations(profile);
  const actionPlan = generateActionPlan(profile);

  const companyName = profile.identity?.name?.value || 'Company';

  return {
    generatedAt: new Date().toISOString(),
    version: 1,
    companyName,
    executiveSummary: `This Executive Marketing Strategic Report presents a rigorous, evidence-based diagnostic of ${companyName}. Based strictly on verified company data, the organization has achieved a Business Health Score of ${health.score}/100 and a Marketing Readiness Score of ${readiness.score}/100.`,
    companyOverview: `Industry: ${profile.identity?.industry?.value || 'Not provided'} | Stage: ${profile.identity?.startupStage?.value || 'Not provided'} | Location: ${profile.identity?.location?.value || 'Not provided'}`,
    businessHealth: health,
    marketingReadiness: readiness,
    dataConfidence: {
      completenessPercentage: health.score,
      confidenceScore: health.confidence,
      missingFields: health.missingData.map(f => ({ fieldKey: f, label: f, impact: 'High' })),
      explanation: `Report calculations derived from ${health.score}% complete verified company profile.`
    },
    swot,
    personas,
    positioning,
    industryAnalysis: {
      content: profile.identity?.industry?.value 
        ? `Industry analysis focused on ${profile.identity.industry.value}. External live market feed currently unconfigured.`
        : 'External market data unavailable.',
      externalDataAvailable: false
    },
    channelAnalysis: channels,
    budgetAllocation: budget,
    funnel,
    customerJourney: journey,
    kpiAnalysis: kpis,
    recommendations,
    actionPlan,
    dataGaps: health.missingData,
    sources: [
      { title: 'Company Onboarding Profile', type: 'Verified User Input', date: new Date().toISOString().split('T')[0] }
    ]
  };
}
