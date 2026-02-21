# B2B Inventory - Backend API (NestJS)
FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY saas/backend/package*.json ./

# Install all deps (including dev for build)
RUN npm ci

# Copy backend source
COPY saas/backend ./

# Build
RUN npm run build

# Remove dev deps, keep only production
RUN npm prune --production

EXPOSE 3000

CMD ["node", "dist/main.js"]
