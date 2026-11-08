# Use the official Node 20 Alpine image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the remaining frontend source code
COPY . .

# Expose the default Vite port
EXPOSE 5173

# Start the Vite development server and expose it to the Docker network
CMD ["npm", "run", "dev", "--", "--host"]