export const API_URL = process.env.API_URL || 'http://localhost:3000/api';

export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'your_cloud_name',
  API_KEY: 'your_api_key',
  API_SECRET: 'your_api_secret',
};

export const AI_CONFIG = {
    VECTOR_DIMENSION: 1536, // Chẳng hạn cho OpenAI Embeddings
    MIN_SCORE_THRESHOLD: 0.7,
    MAX_RECOMMENDATIONS: 20
};
