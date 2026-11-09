# Use the official Node 20 Alpine image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Ensure proper non-root directory ownership
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Copy package dependency manifests
COPY --chown=node:node package*.json ./

# Install exact locked dependencies (scripts allowed so bcrypt can build its binaries)
RUN npm ci --omit=dev

# Copy application source and environment explicitly
COPY --chown=node:node src/ ./src/
COPY --chown=node:node server.js ./

# Expose backend port
EXPOSE 5000

# Start application
CMD ["npm", "start"]