import { KPIEngineMetrics, MetricValue } from '../../../shared/types';

export function calculateKPIs(profile: Record<string, any>, campaignData: any[] = []): KPIEngineMetrics {
  const m = profile.marketing || {};
  const currency = m.currency?.value || '₹';

  const spend = m.monthlyBudget?.value;
  const revenue = m.monthlyRevenue?.value;
  const sales = m.monthlySales?.value;
  const leads = m.monthlyLeads?.value;
  const traffic = m.websiteTraffic?.value;
  const conversionRate = m.conversionRate?.value;
  const retention = m.retentionRate?.value;
  const repeatPurchase = m.repeatPurchaseRate?.value;

  const insufficient = (reason: string): MetricValue => ({
    value: null,
    status: 'INSUFFICIENT_DATA',
    explanation: 'Insufficient data to calculate this metric.',
    calculationMethod: reason
  });

  // 1. CAC = Spend / Sales (acquired customers)
  let cac: MetricValue;
  if (m.currentCac?.value) {
    cac = {
      value: `${currency}${m.currentCac.value}`,
      status: 'AVAILABLE',
      source: m.currentCac.source || 'user_input'
    };
  } else if (spend && sales && sales > 0) {
    const calcVal = Math.round(spend / sales);
    cac = {
      value: `${currency}${calcVal}`,
      status: 'CALCULATED',
      explanation: `Calculated from monthly budget (${currency}${spend}) divided by monthly sales (${sales}).`,
      calculationMethod: `${currency}${spend} / ${sales} = ${currency}${calcVal}`
    };
  } else {
    cac = insufficient('Requires monthly marketing spend and total acquired customers/sales.');
  }

  // 2. ROAS = Revenue / Spend
  let roas: MetricValue;
  if (m.currentRoas?.value) {
    roas = {
      value: `${m.currentRoas.value}x`,
      status: 'AVAILABLE',
      source: m.currentRoas.source || 'user_input'
    };
  } else if (revenue && spend && spend > 0) {
    const calcVal = parseFloat((revenue / spend).toFixed(2));
    roas = {
      value: `${calcVal}x`,
      status: 'CALCULATED',
      explanation: `Calculated from monthly revenue (${currency}${revenue}) divided by monthly budget (${currency}${spend}).`,
      calculationMethod: `${currency}${revenue} / ${currency}${spend} = ${calcVal}x`
    };
  } else {
    roas = insufficient('Requires monthly marketing spend and revenue attributed to marketing.');
  }

  // 3. Conversion Rate
  let convRate: MetricValue;
  if (conversionRate) {
    convRate = {
      value: `${conversionRate}%`,
      status: 'AVAILABLE',
      source: 'user_input'
    };
  } else if (sales && traffic && traffic > 0) {
    const calcVal = parseFloat(((sales / traffic) * 100).toFixed(2));
    convRate = {
      value: `${calcVal}%`,
      status: 'CALCULATED',
      explanation: `Calculated from monthly sales (${sales}) divided by total visitors (${traffic}).`,
      calculationMethod: `(${sales} / ${traffic}) * 100 = ${calcVal}%`
    };
  } else {
    convRate = insufficient('Requires total website traffic visitors and total conversions/sales.');
  }

  // 4. AOV (Average Order Value) = Revenue / Sales
  let aov: MetricValue;
  if (revenue && sales && sales > 0) {
    const calcVal = Math.round(revenue / sales);
    aov = {
      value: `${currency}${calcVal}`,
      status: 'CALCULATED',
      explanation: `Calculated from total revenue (${currency}${revenue}) divided by total orders/sales (${sales}).`,
      calculationMethod: `${currency}${revenue} / ${sales} = ${currency}${calcVal}`
    };
  } else {
    aov = insufficient('Requires total sales revenue and total order count.');
  }

  // 5. Monthly Revenue
  const revMetric: MetricValue = revenue ? {
    value: `${currency}${revenue.toLocaleString()}`,
    status: 'AVAILABLE',
    source: 'user_input'
  } : insufficient('Monthly revenue baseline not provided.');

  // 6. Monthly Leads
  const leadsMetric: MetricValue = leads ? {
    value: leads.toLocaleString(),
    status: 'AVAILABLE',
    source: 'user_input'
  } : insufficient('Monthly lead volume baseline not provided.');

  // 7. Website Traffic
  const trafficMetric: MetricValue = traffic ? {
    value: traffic.toLocaleString(),
    status: 'AVAILABLE',
    source: 'user_input'
  } : insufficient('Monthly website traffic baseline not provided.');

  // 8. Retention Rate
  const retentionMetric: MetricValue = retention ? {
    value: `${retention}%`,
    status: 'AVAILABLE',
    source: 'user_input'
  } : insufficient('Retention rate metric not provided.');

  // 9. Repeat Purchase Rate
  const repeatMetric: MetricValue = repeatPurchase ? {
    value: `${repeatPurchase}%`,
    status: 'AVAILABLE',
    source: 'user_input'
  } : insufficient('Repeat purchase rate metric not provided.');

  // Unprovided / Missing metrics
  const ctrMetric = insufficient('CTR requires ad impression and click campaign tracking data.');
  const cpcMetric = insufficient('CPC requires click-through spend and click tracking data.');
  const cpmMetric = insufficient('CPM requires cost-per-mille impression campaign data.');
  const ltvMetric = insufficient('LTV requires customer lifespan and average gross margin data.');
  const churnMetric = insufficient('Churn rate requires subscription cancellation tracking data.');

  return {
    cac,
    roas,
    revenue: revMetric,
    leads: leadsMetric,
    conversionRate: convRate,
    websiteTraffic: trafficMetric,
    ctr: ctrMetric,
    cpc: cpcMetric,
    cpm: cpmMetric,
    ltv: ltvMetric,
    retentionRate: retentionMetric,
    repeatPurchaseRate: repeatMetric,
    churnRate: churnMetric,
    aov
  };
}
