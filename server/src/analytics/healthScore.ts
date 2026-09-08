import { BusinessHealthScore, BusinessHealthFactor } from '../../../shared/types';

export function calculateBusinessHealthScore(profile: Record<string, any>): BusinessHealthScore & {
  isVerified: boolean;
  statusMessage: string;
} {
  const name = profile.identity?.name?.value;
  const industry = profile.identity?.industry?.value;
  const description = profile.businessDescription?.description?.value;
  const products = profile.businessDescription?.productsServices?.value;
  const budget = profile.marketing?.monthlyBudget?.value;

  // Check minimum verification threshold
  const hasBasicVerification = Boolean(name && (industry || description || (products && products.length > 0) || budget));

  if (!name || !hasBasicVerification) {
    return {
      score: 0,
      confidence: 0,
      factors: [],
      missingData: ['identity.industry', 'businessDescription.description', 'marketing.monthlyBudget'],
      isVerified: false,
      statusMessage: 'Company information could not be verified.'
    };
  }

  const dimensions = [
    {
      dimension: 'Business Clarity',
      fields: ['identity.name', 'identity.industry', 'businessDescription.description'],
      weight: 15
    },
    {
      dimension: 'Product Clarity',
      fields: ['businessDescription.productsServices', 'businessDescription.usp', 'businessDescription.pricingModel'],
      weight: 15
    },
    {
      dimension: 'Customer Clarity',
      fields: ['targetCustomer.idealCustomer', 'targetCustomer.painPoints', 'targetCustomer.demographics'],
      weight: 20
    },
    {
      dimension: 'Competitive Clarity',
      fields: ['competition.competitors', 'competition.competitiveAdvantages'],
      weight: 15
    },
    {
      dimension: 'Marketing Maturity',
      fields: ['marketing.currentChannels', 'marketing.monthlyBudget'],
      weight: 15
    },
    {
      dimension: 'KPI Completeness',
      fields: ['marketing.monthlyRevenue', 'marketing.currentCac', 'marketing.conversionRate'],
      weight: 10
    },
    {
      dimension: 'Goal Clarity',
      fields: ['goals.primaryGoal'],
      weight: 10
    }
  ];

  let totalScore = 0;
  let totalConfidenceSum = 0;
  const factors: BusinessHealthFactor[] = [];
  const missingData: string[] = [];

  dimensions.forEach(dim => {
    let presentCount = 0;
    const dimMissing: string[] = [];

    dim.fields.forEach(fieldKey => {
      const parts = fieldKey.split('.');
      const val = profile[parts[0]]?.[parts[1]]?.value;
      const isPresent = val !== null && val !== undefined && val !== '' && (Array.isArray(val) ? val.length > 0 : true);

      if (isPresent) {
        presentCount++;
      } else {
        dimMissing.push(fieldKey);
        missingData.push(fieldKey);
      }
    });

    const ratio = presentCount / dim.fields.length;
    const dimScore = Math.round(ratio * 100);
    totalScore += ratio * dim.weight;
    totalConfidenceSum += ratio;

    factors.push({
      dimension: dim.dimension,
      score: dimScore,
      clarity: dimScore >= 80 ? 'High' : dimScore >= 50 ? 'Medium' : 'Low',
      missingFields: dimMissing
    });
  });

  const finalScore = Math.round(totalScore);
  const confidence = parseFloat((totalConfidenceSum / dimensions.length).toFixed(2));

  return {
    score: finalScore,
    confidence,
    factors,
    missingData,
    isVerified: true,
    statusMessage: finalScore >= 30 
      ? 'Company information successfully retrieved.' 
      : 'Insufficient data to generate a reliable analysis.'
  };
}
