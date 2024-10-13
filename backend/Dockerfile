# Set base image
FROM node:16-alpine3.16

# Set the working directory
WORKDIR /backend

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies, prune dev dependencies, and clear cache in a single layer
RUN npm install --production && \
    npm prune --production && \
    npm cache clean --force && \
    rm -rf /tmp/* /root/.npm /usr/share/man /var/cache/apk/*

# Copy the rest of the application code
COPY . .

# Set the environment variable for the app
ENV NODE_ENV=production

# Expose the port used by the app
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
