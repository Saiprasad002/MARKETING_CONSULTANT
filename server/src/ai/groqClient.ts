import Groq from 'groq-sdk';
import { safeParseJSON } from './jsonParser';
import { SYSTEM_PROMPTS } from './promptTemplates';

// Resolve environment variables for xAI / Grok or Groq
const xaiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY || '';
const groqKey = process.env.GROQ_API_KEY || '';

// Determine active key & provider
const apiKey = xaiKey || groqKey;
const isXAI = xaiKey.startsWith('xai-') || (!groqKey && Boolean(xaiKey));

const groq = (groqKey || (!isXAI && apiKey)) ? new Groq({ apiKey: groqKey || apiKey }) : null;

// Default to active model
const defaultModel = isXAI ? 'grok-2-latest' : 'openai/gpt-oss-120b';
const configuredModel = process.env.XAI_MODEL || process.env.GROK_MODEL || process.env.GROQ_MODEL || defaultModel;

export async function callLLM(
  systemPrompt: string,
  userMessage: string,
  model = configuredModel,
  temperature = 0.2
): Promise<{ text: string; error?: string }> {
  if (!apiKey) {
    return { 
      text: '', 
      error: 'AI service is not configured. Please configure the XAI_API_KEY or GROQ_API_KEY in server/.env.' 
    };
  }

  // 1. If using xAI / Grok directly (OpenAI-compatible HTTP client)
  if (isXAI && xaiKey) {
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${xaiKey}`
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          model,
          temperature,
          max_tokens: 4096
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 401) {
          return { text: '', error: 'AI authentication failed. Please check your XAI API key.' };
        }
        if (response.status === 429) {
          return { text: '', error: 'AI request limit reached. Please try again later.' };
        }
        return { text: '', error: `xAI API Error (${response.status}): ${errText}` };
      }

      const data: any = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      return { text };
    } catch (err: any) {
      console.error('xAI Connection Error:', err);
      return { text: '', error: 'Unable to connect to the AI service.' };
    }
  }

  // 2. If using Groq SDK
  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        model,
        temperature,
        max_tokens: 4096
      });
      const text = completion.choices[0]?.message?.content || '';
      return { text };
    } catch (error: any) {
      console.error('Groq SDK Error:', error);
      if (error.status === 401 || (error.message && error.message.includes('401'))) {
        return { text: '', error: 'AI authentication failed. Please check the GROQ_API_KEY.' };
      }
      if (error.status === 429 || (error.message && error.message.includes('429'))) {
        return { text: '', error: 'AI request limit reached. Please try again later.' };
      }
      return { text: '', error: `AI service error: ${error.message || 'Unable to connect to AI service.'}` };
    }
  }

  return { text: '', error: 'AI service is not configured. Please configure the XAI_API_KEY or GROQ_API_KEY in server/.env.' };
}

export async function extractEntitiesWithLLM(text: string): Promise<Record<string, any>> {
  const result = await callLLM(SYSTEM_PROMPTS.ENTITY_EXTRACTION, `User input: "${text}"`);
  
  if (result.text) {
    const parsed = safeParseJSON(result.text, null);
    if (parsed) return parsed;
  }

  return {};
}

export async function generateConsultantResponse(
  conversationHistory: { sender: string; content: string }[],
  companyProfile: Record<string, any>
): Promise<{ text: string; error?: string }> {
  // Retain last 10 messages for token context efficiency
  const recentHistory = conversationHistory.slice(-10);
  const historyText = recentHistory.map(m => `${m.sender.toUpperCase()}: ${m.content}`).join('\n');
  const profileSummary = JSON.stringify(companyProfile, null, 2);

  const prompt = `Current Structured Company Profile:\n${profileSummary}\n\nConversation History:\n${historyText}\n\nAs a Senior Marketing Consultant, respond to the user's latest statement. Ask the next most critical missing business question (e.g. target customer, budget, channels, goals, metrics). Be professional, encouraging, and clear.`;

  return callLLM(SYSTEM_PROMPTS.SENIOR_MARKETING_CONSULTANT, prompt);
}

export async function generateUnifiedConsultantResponse(
  conversationHistory: { sender: string; content: string }[],
  companyProfile: Record<string, any>,
  analyticsReport: Record<string, any>
): Promise<{ text: string; error?: string }> {
  // Truncate recent history to last 6 messages and limit content size per message
  const recentHistory = conversationHistory.slice(-6).map(m => {
    const text = m.content.length > 400 ? m.content.substring(0, 400) + '...' : m.content;
    return `${m.sender.toUpperCase()}: ${text}`;
  }).join('\n');

  // Concise profile summary to optimize token efficiency
  const summaryProfile = {
    name: companyProfile.identity?.name?.value,
    industry: companyProfile.identity?.industry?.value,
    businessType: companyProfile.identity?.businessType?.value,
    stage: companyProfile.identity?.startupStage?.value,
    description: companyProfile.businessDescription?.description?.value,
    usp: companyProfile.businessDescription?.usp?.value,
    products: companyProfile.businessDescription?.productsServices?.value,
    idealCustomer: companyProfile.targetCustomer?.idealCustomer?.value,
    competitors: companyProfile.competition?.competitors?.value,
    monthlyBudget: companyProfile.marketing?.monthlyBudget?.value ? `${companyProfile.marketing?.currency?.value || '₹'}${companyProfile.marketing?.monthlyBudget?.value}` : null,
    channels: companyProfile.marketing?.currentChannels?.value,
    primaryGoal: companyProfile.goals?.primaryGoal?.value
  };

  // Concise analytics summary
  const summaryAnalytics = {
    healthScore: analyticsReport.businessHealth?.score,
    readinessScore: analyticsReport.marketingReadiness?.score,
    cac: analyticsReport.kpiAnalysis?.cac?.value,
    roas: analyticsReport.kpiAnalysis?.roas?.value,
    revenue: analyticsReport.kpiAnalysis?.revenue?.value,
    swot: analyticsReport.swot?.map((s: any) => `${s.category}: ${s.title}`).slice(0, 6),
    personas: analyticsReport.personas?.map((p: any) => `${p.name} (${p.role})`).slice(0, 3),
    recommendations: analyticsReport.recommendations?.map((r: any) => r.title).slice(0, 5)
  };

  const promptContext = `
VERIFIED COMPANY DETAILS:
${JSON.stringify(summaryProfile, null, 2)}

CALCULATED ANALYTICS METRICS:
${JSON.stringify(summaryAnalytics, null, 2)}

CONVERSATION HISTORY:
${recentHistory}

Provide actionable, evidence-based recommendations and clear strategic guidance as Senior AI Marketing Consultant tailored to their company context. Keep context across follow-up questions.`;

  let res = await callLLM(SYSTEM_PROMPTS.UNIFIED_AI_CONSULTANT, promptContext);
  if (res.error && (res.error.includes('rate_limit_exceeded') || res.error.includes('413'))) {
    console.log('Primary model hit token limit, falling back to llama-3.1-8b-instant...');
    res = await callLLM(SYSTEM_PROMPTS.UNIFIED_AI_CONSULTANT, promptContext, 'llama-3.1-8b-instant');
  }
  return res;
}
