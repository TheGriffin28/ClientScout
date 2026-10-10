# Use official LTS Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["npm", "start"]
