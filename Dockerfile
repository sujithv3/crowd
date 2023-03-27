# Base image node
FROM node:latest

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app files
COPY . .

# Set environment variable
#ENV NODE_ENV production

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
