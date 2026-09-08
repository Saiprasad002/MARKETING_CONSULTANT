export function evaluateGrowthPotential(profile: Record<string, any>): {
  assessment: string;
  reasons: string[];
  confidence: number;
} {
  const budget = profile.marketing?.monthlyBudget?.value;
  const goal = profile.goals?.primaryGoal?.value;
  const industry = profile.identity?.industry?.value;
  const channels = profile.marketing?.currentChannels?.value;
  const revenue = profile.marketing?.monthlyRevenue?.value;

  const reasons: string[] = [];

  if (!industry || !goal) {
    return {
      assessment: 'Growth potential cannot be reliably quantified with the available data.',
      reasons: ['Industry classification or primary growth goals have not been provided yet.'],
      confidence: 0
    };
  }

  if (budget && budget > 0) {
    reasons.push(`Active capital allocation identified (${profile.marketing?.currency?.value || '₹'}${budget.toLocaleString()}/month)`);
  }

  if (channels && Array.isArray(channels) && channels.length > 0) {
    reasons.push(`Multi-channel distribution foundation established (${channels.length} active channels)`);
  }

  if (revenue && revenue > 0) {
    reasons.push('Demonstrated market demand signal and commercial traction');
  }

  if (reasons.length >= 2) {
    return {
      assessment: 'High Growth Opportunity',
      reasons,
      confidence: 0.85
    };
  } else if (reasons.length === 1) {
    return {
      assessment: 'Moderate Growth Opportunity',
      reasons,
      confidence: 0.6
    };
  } else {
    return {
      assessment: 'Growth potential cannot be reliably quantified with the available data.',
      reasons: ['Insufficient quantitative sales baseline, budget, or acquisition metrics provided.'],
      confidence: 0.3
    };
  }
}
