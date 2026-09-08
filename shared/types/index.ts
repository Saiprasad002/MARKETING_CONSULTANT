export type ProfileSource = 
  | 'user_chat'
  | 'uploaded_document'
  | 'manual_edit'
  | 'ai_inference'
  | 'external_research';

export interface FieldMetadata<T = any> {
  field: string;
  value: T;
  source: ProfileSource;
  confidence: number;
  lastUpdated: string;
  verified: boolean;
}

export type MetricStatus = 'AVAILABLE' | 'CALCULATED' | 'ESTIMATED' | 'INSUFFICIENT_DATA';

export interface MetricValue {
  value: number | string | null;
  status: MetricStatus;
  unit?: string;
  period?: string;
  source?: string;
  explanation?: string;
  calculationMethod?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  companyId?: string;
  workspaceId?: string;
  onboardingCompleted?: boolean;
  createdAt: string;
}

export interface Company {
  id: string;
  ownerId: string;
  name: string;
  logo?: string;
  website?: string;
  industry?: string;
  subIndustry?: string;
  businessType?: 'B2B' | 'B2C' | 'B2B2C' | 'D2C' | 'SaaS' | 'Marketplace' | 'Services' | string;
  startupStage?: 'Idea' | 'Early Stage' | 'Growth' | 'Established' | string;
  location?: string;
  operatingRegions?: string[];
  employeesCount?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  companyId: string;
  name: string;
  createdAt: string;
}

export interface CompanyProfile {
  identity: {
    name: FieldMetadata<string>;
    logo: FieldMetadata<string>;
    website: FieldMetadata<string>;
    industry: FieldMetadata<string>;
    subIndustry: FieldMetadata<string>;
    businessType: FieldMetadata<string>;
    startupStage: FieldMetadata<string>;
    location: FieldMetadata<string>;
    operatingRegions: FieldMetadata<string[]>;
    employeesCount: FieldMetadata<string>;
  };
  businessDescription: {
    description: FieldMetadata<string>;
    productsServices: FieldMetadata<string[]>;
    usp: FieldMetadata<string>;
    businessModel: FieldMetadata<string>;
    pricingModel: FieldMetadata<string>;
    revenueModel: FieldMetadata<string>;
  };
  targetCustomer: {
    idealCustomer: FieldMetadata<string>;
    demographics: FieldMetadata<string>;
    geography: FieldMetadata<string>;
    painPoints: FieldMetadata<string[]>;
    motivations: FieldMetadata<string[]>;
    buyingBehavior: FieldMetadata<string>;
    targetSegments: FieldMetadata<string[]>;
  };
  competition: {
    competitors: FieldMetadata<string[]>;
    competitiveAdvantages: FieldMetadata<string[]>;
    competitiveWeaknesses: FieldMetadata<string[]>;
    marketPosition: FieldMetadata<string>;
  };
  marketing: {
    currentChannels: FieldMetadata<string[]>;
    currentAdPlatforms: FieldMetadata<string[]>;
    monthlyBudget: FieldMetadata<number | null>;
    currency: FieldMetadata<string>;
    currentCac: FieldMetadata<number | null>;
    currentRoas: FieldMetadata<number | null>;
    conversionRate: FieldMetadata<number | null>;
    websiteTraffic: FieldMetadata<number | null>;
    monthlyLeads: FieldMetadata<number | null>;
    monthlySales: FieldMetadata<number | null>;
    monthlyRevenue: FieldMetadata<number | null>;
    retentionRate: FieldMetadata<number | null>;
    repeatPurchaseRate: FieldMetadata<number | null>;
  };
  goals: {
    primaryGoal: FieldMetadata<string>;
    secondaryGoals: FieldMetadata<string[]>;
    growthTargets: FieldMetadata<string>;
  };
}

export interface SWOTItem {
  id: string;
  category: 'STRENGTH' | 'WEAKNESS' | 'OPPORTUNITY' | 'THREAT';
  title: string;
  explanation: string;
  evidence: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  source?: string;
}

export interface CustomerPersona {
  id: string;
  name: string;
  role: string;
  ageRange: string;
  incomeRange: string;
  geography: string;
  painPoints: string[];
  motivations: string[];
  preferredChannels: string[];
  buyingBehavior: string;
  purchaseTriggers: string[];
  objections: string[];
  isHypothesis?: boolean;
}

export interface MarketPositioning {
  currentPositioning: string;
  recommendedPositioning: string;
  differentiation: string[];
  messagingPillars: {
    pillar: string;
    description: string;
    supportingEvidence: string;
  }[];
  confidence: number;
}

export interface ChannelAnalysis {
  channel: string;
  fitScore: number; // 0-100
  reason: string;
  recommendedPriority: 'HIGH' | 'MEDIUM' | 'LOW';
  budgetRecommendation: string;
  expectedOutcome: string;
  confidence: number;
  currentCpa: MetricValue;
  currentRoas: MetricValue;
}

export interface BudgetItem {
  category: string;
  amount: number;
  percentage: number;
  reason: string;
}

export interface BudgetAllocation {
  totalBudget: number;
  currency: string;
  items: BudgetItem[];
  confidence: number;
  rationale: string;
  status: MetricStatus;
}

export interface FunnelStage {
  stage: 'Awareness' | 'Consideration' | 'Conversion' | 'Retention';
  tactics: string[];
  channels: string[];
  kpi: string;
  baseline: MetricValue;
  target: string;
  measurementMethod: string;
}

export interface CustomerJourneyPhase {
  phase: string;
  touchpoints: string[];
  customerAction: string;
  companyAction: string;
  friction: string;
  opportunity: string;
  kpi: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  rationale: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  expectedImpact: string;
  estimatedEffort: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedCost: string;
  timeframe: string;
  requiredData: string[];
  supportingEvidence: string;
  confidence: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Deferred';
}

export interface ActionPlanItem {
  timeframePhase: 'Days 1–30' | 'Days 31–60' | 'Days 61–90';
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  expectedImpact: string;
  kpisToTrack: string[];
}

export interface Document {
  id: string;
  companyId: string;
  filename: string;
  originalName: string;
  fileType: string;
  size: number;
  storagePath: string;
  status: 'Uploading' | 'Processing' | 'Analyzing' | 'Processed' | 'Error';
  errorMessage?: string;
  insightsCount: number;
  uploadedAt: string;
}

export interface DocumentInsight {
  id: string;
  documentId: string;
  key: string;
  value: string;
  confidence: number;
  verified: boolean;
  sourceChunk?: string;
}

export interface DataConflict {
  id: string;
  companyId: string;
  field: string;
  previousValue: any;
  newValue: any;
  source: string;
  timestamp: string;
  status: 'PENDING' | 'RESOLVED';
  resolvedValue?: any;
}

export interface AnalyticsSnapshot {
  id: string;
  companyId: string;
  version: number;
  healthScore: number;
  readinessScore: number;
  growthPotential: string;
  dataCompleteness: number;
  snapshotDataJson: string;
  createdAt: string;
}

export interface DataQualityReport {
  completenessPercentage: number;
  confidenceScore: number;
  missingFields: { fieldKey: string; label: string; impact: string }[];
  explanation: string;
}

export interface BusinessHealthFactor {
  dimension: string;
  score: number;
  clarity: string;
  missingFields: string[];
}

export interface BusinessHealthScore {
  score: number;
  confidence: number;
  factors: BusinessHealthFactor[];
  missingData: string[];
}

export interface MarketingReadinessScore {
  score: number;
  confidence: number;
  positiveFactors: string[];
  negativeFactors: string[];
  missingInformation: string[];
}

export interface KPIEngineMetrics {
  cac: MetricValue;
  roas: MetricValue;
  revenue: MetricValue;
  leads: MetricValue;
  conversionRate: MetricValue;
  websiteTraffic: MetricValue;
  ctr: MetricValue;
  cpc: MetricValue;
  cpm: MetricValue;
  ltv: MetricValue;
  retentionRate: MetricValue;
  repeatPurchaseRate: MetricValue;
  churnRate: MetricValue;
  aov: MetricValue;
}

export interface ExecutiveReport {
  generatedAt: string;
  version: number;
  companyName: string;
  executiveSummary: string;
  companyOverview: string;
  businessHealth: BusinessHealthScore;
  marketingReadiness: MarketingReadinessScore;
  dataConfidence: DataQualityReport;
  swot: SWOTItem[];
  personas: CustomerPersona[];
  positioning: MarketPositioning;
  industryAnalysis: {
    content: string;
    externalDataAvailable: boolean;
    source?: string;
    date?: string;
  };
  channelAnalysis: ChannelAnalysis[];
  budgetAllocation: BudgetAllocation;
  funnel: FunnelStage[];
  customerJourney: CustomerJourneyPhase[];
  kpiAnalysis: KPIEngineMetrics;
  recommendations: Recommendation[];
  actionPlan: ActionPlanItem[];
  dataGaps: string[];
  sources: { title: string; type: string; date: string }[];
}

export interface ChatMessage {
  id: string;
  consultationId?: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  extractedEntities?: Record<string, any>;
  auditableAnswer?: {
    answer: string;
    facts: string[];
    calculations: string[];
    recommendations: string[];
    missingData: string[];
    confidence: number;
    sources: string[];
  };
  timestamp: string;
}
