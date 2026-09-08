import { MarketingReadinessScore } from '../../../shared/types';

export function calculateMarketingReadinessScore(profile: Record<string, any>): MarketingReadinessScore & {
  statusMessage: string;
} {
  const positiveFactors: string[] = [];
  const negativeFactors: string[] = [];
  const missingInformation: string[] = [];

  let score = 0;

  // 1. Audience Clarity
  const idealCustomer = profile.targetCustomer?.idealCustomer?.value;
  if (idealCustomer) {
    score += 20;
    positiveFactors.push('Ideal customer persona defined');
  } else {
    negativeFactors.push('Ideal customer persona undefined');
    missingInformation.push('Target Customer Persona');
  }

  // 2. Value Proposition
  const usp = profile.businessDescription?.usp?.value;
  if (usp) {
    score += 20;
    positiveFactors.push('Unique Selling Proposition (USP) documented');
  } else {
    negativeFactors.push('USP and differentiation unclear');
    missingInformation.push('Unique Selling Proposition');
  }

  // 3. Marketing Budget
  const budget = profile.marketing?.monthlyBudget?.value;
  if (budget && budget > 0) {
    score += 15;
    positiveFactors.push(`Monthly marketing budget allocated (${profile.marketing?.currency?.value || '₹'}${budget.toLocaleString()})`);
  } else {
    negativeFactors.push('No monthly marketing budget specified');
    missingInformation.push('Monthly Marketing Budget');
  }

  // 4. Marketing Channels
  const channels = profile.marketing?.currentChannels?.value;
  if (channels && Array.isArray(channels) && channels.length > 0) {
    score += 15;
    positiveFactors.push(`Active marketing channels defined (${channels.join(', ')})`);
  } else {
    negativeFactors.push('No active marketing acquisition channels identified');
    missingInformation.push('Active Marketing Channels');
  }

  // 5. Goals
  const goal = profile.goals?.primaryGoal?.value;
  if (goal) {
    score += 15;
    positiveFactors.push(`Primary business growth goal specified (${goal})`);
  } else {
    negativeFactors.push('Primary business goal unstated');
    missingInformation.push('Primary Business Goal');
  }

  // 6. Metrics & Performance Baseline
  const cac = profile.marketing?.currentCac?.value;
  const revenue = profile.marketing?.monthlyRevenue?.value;
  if (cac || revenue) {
    score += 15;
    positiveFactors.push('Historical performance metrics available');
  } else {
    negativeFactors.push('Lack of historical baseline CAC or Revenue metrics');
    missingInformation.push('Historical CAC / Revenue Data');
  }

  const confidence = parseFloat((score / 100).toFixed(2));

  return {
    score,
    confidence,
    positiveFactors,
    negativeFactors,
    missingInformation,
    statusMessage: score >= 30 
      ? 'Marketing readiness diagnostic complete.' 
      : 'Insufficient data to generate a reliable analysis.'
  };
}
