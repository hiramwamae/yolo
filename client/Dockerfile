# Build stage
FROM node:16-alpine3.16 as build-stage

# Set the working directory inside the container
WORKDIR /client

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies and clean up the cache
RUN npm install --production && \
    npm cache clean --force && \
    rm -rf /tmp/*

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:16-alpine3.16 as production-stage

# Set the working directory
WORKDIR /client

# Install only the minimal dependencies for the production stage
COPY --from=build-stage /client/package*.json ./

# Install only production dependencies
RUN npm install --production && \
    npm prune --production && \
    rm -rf /root/.npm && \
    rm -rf /tmp/*

# Copy the build files from the build stage
COPY --from=build-stage /client/build ./build

# Set environment to production
ENV NODE_ENV=production

# Expose the port used by the app
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
