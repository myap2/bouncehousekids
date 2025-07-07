# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy the entire project (for workspace setup)
COPY . .

# Install all dependencies from root (workspace setup)
RUN npm ci

# Build the server application
WORKDIR /app/server
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]