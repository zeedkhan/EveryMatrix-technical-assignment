# Dockerfile for backend
FROM node:20.11.1-alpine3.19 AS build

# Install Prisma CLI
RUN npm install -g prisma

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the entire app
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 8000

# Command to run the app
CMD ["npm", "run", "start"]