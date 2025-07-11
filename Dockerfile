FROM node:18-alpine

WORKDIR /app

# Install dependencies for better caching
COPY package*.json ./
COPY src/client/package*.json ./src/client/

# Install all dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Build client for production with PWA optimization
ENV NODE_ENV=production
RUN npm run build

# Verify PWA files are built correctly
RUN echo "Checking PWA files..." && \
    ls -la src/client/dist/ && \
    test -f src/client/dist/manifest.json && \
    test -f src/client/dist/sw.js && \
    test -f src/client/dist/offline.html && \
    echo "PWA files verified successfully"

# Create data directory for @seald-io/nedb
RUN mkdir -p /app/data

# Set proper permissions for data directory
RUN chmod -R 755 /app/data

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S freemob -u 1001
RUN chown -R freemob:nodejs /app

# Switch to non-root user
USER freemob

# Expose the port (internal container port)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/settings', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the application
CMD ["npm", "start"] 