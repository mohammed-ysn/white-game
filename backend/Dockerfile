FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared package
COPY shared/package*.json ./shared/
COPY shared/tsconfig.json ./shared/
COPY shared/types ./shared/types/

# Install shared dependencies and build
WORKDIR /app/shared
RUN npm ci
RUN npm run build

# Copy backend package files
WORKDIR /app/backend
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy backend source
COPY backend/src ./src

# Build backend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy shared package
COPY --from=builder /app/shared/package*.json ./shared/
COPY --from=builder /app/shared/types ./shared/types/

# Copy backend
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/dist ./dist

# Install production dependencies only
RUN npm ci --only=production

EXPOSE 3000

CMD ["node", "dist/index.js"]