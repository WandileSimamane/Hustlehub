# Use the official Node 20 Alpine image for a lightweight, secure foundation
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker's caching mechanism
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the remaining backend source code, including your certs folder
COPY . .

# Expose the secure port your Express server listens on
EXPOSE 5000

# Start the Node server
CMD ["npm", "start"]