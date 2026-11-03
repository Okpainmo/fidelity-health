import validatedEnv from '../utils/base.js';

export const aiConfig = {
  apiKey: validatedEnv.OPENAI_API_KEY,
  baseUrl: validatedEnv.OPENAI_BASE_URL,
  model: validatedEnv.MISSIE_MODEL
};

export default aiConfig;
