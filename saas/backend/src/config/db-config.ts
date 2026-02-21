/**
 * Database configuration - MongoDB (Pabbly: config folder)
 * Set MONGODB_URI in .env (copy from .env.example)
 */
export const getMongoUri = (): string => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required. Copy backend/.env.example to .env and set MONGODB_URI.');
  }
  return uri;
};
