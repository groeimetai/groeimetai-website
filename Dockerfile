# Use multi-stage build for smaller final image
FROM node:20-alpine AS dependencies
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files first (for better caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source files
COPY . .

# Set build arguments for environment variables
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ARG NEXT_PUBLIC_GEMINI_API_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Set environment variables for build
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ENV NEXT_PUBLIC_GEMINI_API_KEY=$NEXT_PUBLIC_GEMINI_API_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set NODE_ENV to production
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
