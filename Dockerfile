FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY src/client/package*.json ./src/client/

# Install dependencies
RUN npm run install:all

# Copy app source
COPY . .

# Build client
RUN npm run build

# Create data directory for @seald-io/nedb
RUN mkdir -p /app/data

# Set permissions for data directory
RUN chmod -R 777 /app/data

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 