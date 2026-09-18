# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the Next.js application
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS production

WORKDIR /app

# Set to production
ENV NODE_ENV=production
ENV PORT=3005

# Copy built application from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose the port
EXPOSE 3005

# Start the application
CMD ["bun", "server.js"]