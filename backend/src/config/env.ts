import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  geminiApiKey: process.env.GEMINI_API_KEY,
};

export const isProduction = env.nodeEnv === 'production';
