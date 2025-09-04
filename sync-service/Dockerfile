FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Create directory for Google credentials
RUN mkdir -p /app/credentials

# Default command
CMD ["node", "sync-projects.js"]