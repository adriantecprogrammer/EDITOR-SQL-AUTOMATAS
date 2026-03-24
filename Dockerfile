# Stage 1: Build the app
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies needed by node-gyp if necessary
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve the app
FROM node:22-alpine AS runner

WORKDIR /app

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Install only production dependencies
RUN npm ci --omit=dev

# Start the Node.js server from the adapter-node build
CMD ["node", "build/index.js"]
