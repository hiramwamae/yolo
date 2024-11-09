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
FROM nginx:alpine as production-stage

# Set working directory inside the container
WORKDIR /usr/share/nginx/html

# Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from build stage to nginx html directory
COPY --from=build-stage /client/build .
COPY --from=build-stage /client/public .
COPY --from=build-stage /client/src .
COPY --from=build-stage /client/package*.json .

# Expose port 80 (nginx default)
EXPOSE 80

# Start nginx to serve the React app
CMD ["nginx", "-g", "daemon off;"]



