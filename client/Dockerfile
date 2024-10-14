# Build stage
FROM node:16-alpine3.16 as build-stage

# Set the working directory inside the container
WORKDIR /client

# Install necessary build tools for Alpine
RUN apk add --no-cache bash g++ make python3

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies
RUN npm install && npm cache clean --force && rm -rf /tmp/*

# Copy the rest of the application code, including the public directory
COPY . .

# Build the React app
RUN npm run build

# Production stage
FROM node:16-alpine3.16 as production-stage

WORKDIR /client

# Copy the build artifacts and the public directory from the build stage
COPY --from=build-stage /client/build ./build
COPY --from=build-stage /client/public ./public
COPY --from=build-stage /client/src ./src
COPY --from=build-stage /client/package*.json ./

# Install only production dependencies
RUN npm install --only=production && npm prune --production && npm cache clean --force && rm -rf /tmp/*

# Set the environment variable for the app
ENV NODE_ENV=production

# Expose the port used by the app
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
