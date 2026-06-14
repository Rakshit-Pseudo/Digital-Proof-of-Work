const OpenAI = require('openai');

let openaiClient = null;

const getClient = () => {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    const isOpenRouter = process.env.OPENAI_API_KEY.startsWith('sk-or-');
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
      defaultHeaders: isOpenRouter ? {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Digital Proof of Work',
      } : undefined
    });
  }
  return openaiClient;
};

const chatCompletion = async (systemPrompt, userPrompt, options = {}) => {
  try {
    const client = getClient();
    const isOpenRouter = process.env.OPENAI_API_KEY.startsWith('sk-or-');
    const model = options.model || (isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens || 2000,
      response_format: options.json ? { type: 'json_object' } : undefined,
    });
    return response.choices[0].message.content;
  } catch (error) {
    if (error.message?.includes('OPENAI_API_KEY')) throw error;
    console.error('OpenAI API error:', error.message);
    throw new Error('AI service temporarily unavailable');
  }
};

const parseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse AI response');
  }
};

module.exports = { chatCompletion, parseJSON, getClient };
