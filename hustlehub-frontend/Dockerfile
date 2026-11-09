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

# Install exact locked dependencies without running external scripts
RUN npm ci --ignore-scripts

# Copy frontend source code and ALL Vite/Tailwind configs explicitly
COPY --chown=node:node index.html vite.config.js tailwind.config.js postcss.config.js eslint.config.js ./
COPY --chown=node:node src/ ./src/
COPY --chown=node:node public/ ./public/

# Expose Vite development port
EXPOSE 5173

# Start Vite dev server bound to docker network interface
CMD ["npm", "run", "dev", "--", "--host"]