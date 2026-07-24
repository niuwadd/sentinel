import { registerAs } from '@nestjs/config';
import * as process from 'process';

export const aiConfig = registerAs('ai', () => ({
  provider: process.env.LLM_PROVIDER ?? 'openai',
  apiKey: process.env.OPENAI_API_KEY ?? '',
  modelName: process.env.LLM_MODEL ?? 'gpt-4o',
  temperature: parseFloat(process.env.LLM_TEMPERATURE ?? '0.3'),
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS ?? '1024', 10),
  timeout: parseInt(process.env.LLM_TIMEOUT ?? '15000', 10),
  evaluateInterval: parseInt(process.env.AGENT_EVALUATE_INTERVAL ?? '300', 10),
  fallback: {
    coolThreshold: 30,
    heatThreshold: 18,
  },
}));
