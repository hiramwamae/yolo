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

# Copy only the build directory from the build stage to Nginx's default HTML directory
COPY --from=build-stage /client/build /usr/share/nginx/html

# Expose the port Nginx will listen on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
