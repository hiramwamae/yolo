## 1. Choice of Base Image
 The base image used to build both frontend and backend containers is 'node:16-alpine3.16'. It is derived from the Alpine Linux distribution, making it lightweight and compact. Using Alpine Linux means fewer packages are installed by default, reducing the attack surface and improving security. Using node:16 also provides stability and security for the application.
 
 Used 
 1. Client: 'node:16-alpine3.16'
 2. Backend: 'node:16-alpine3.16'
 3.Mongo : 'mongo'
       

## 2. Dockerfile directives used in the creation and running of each container.
Two Dockerfiles were used. One for the Client and the other one for the Backend.

**Client Dockerfile**

```
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

```
**Backend Dockerfile**

```
# Set base image
FROM node:16-alpine3.16

# Set the working directory
WORKDIR /backend

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies and clears the npm cache and removes any temporary files
RUN npm install --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/*

# Copy the rest of the application code
COPY . .

# Set the environment variable for the app
ENV NODE_ENV=production

# Expose the port used by the app
EXPOSE 5000

# Prune the node_modules directory to remove development dependencies and clears the npm cache and removes any temporary files
RUN npm prune --production && \
    npm cache clean --force && \
    rm -rf /tmp/*

# Start the application
CMD ["npm", "start"]

```

## 3. Docker Compose Networking
The (docker-compose.yml) defines the networking configuration for the project. It includes the allocation of application ports. The relevant sections are as follows:


```
services:
  backend:
    # ...
    ports:
      - "5000:5000"
    networks:
      - yolo-network

  client:
    # ...
    ports:
      - "3000:3000"
    networks:
      - yolo-network
  
  mongodb:
    # ...
    ports:
      - "27017:27017"
    networks:
      - yolo-network

networks:
  yolo-network:
    driver: bridge

volumes:
      - type: volume
        source: app-mongo-data
        target: /data/db
```
In this configuration, the backend container is mapped to port 5000 of the host, the client container is mapped to port 3000 of the host, and mongodb container is mapped to port 27017 of the host. All containers are connected to the yolo-network bridge network. Used a named volume to persist MongoBD data


## 4.  Docker Compose Volume Definition and Usage
The Docker Compose file includes volume definitions for MongoDB data storage. The relevant section is as follows:

yaml

```
volumes:
  mongodata:  # Define Docker volume for MongoDB data
    driver: local

```
This volume, mongodb_data, is designated for storing MongoDB data. It ensures that the data remains intact and is not lost even if the container is stopped or deleted.

## 5. Git Workflow to achieve the task

To achieve the task the following git workflow was used:

1. Fork the repository from the original repository.
2. Clone the repo: `git@github.com:hiramwamae/yolo.git`
3. Rename existing dockerfiles and create new ones. Git ignore old dockerfiles
4. Updated client dockerfile
5. Updated backend dockerfile
6. Updated docker-compose.yaml
7. Build images
8. Updated dockerfile to fix image sizes
9. Encountered 'exited with code 127 client exited'
10. Rebuilt the images with no cache
11. Pushed the images to dockerhub
12. Updated explanation.md file
13. Capture dockerhub image
14. Replace image.png


## Ansible Implementation Explanation.
In the playbook roles was used as follows

  roles: 
   - setup-environment
   - setup-mongodb  
   - backend-deployment
   - frontend-deployment

1. The preriquisites for docker were first installed in the new VM (geerlingguy/ubuntu2004).Docker installed and started. clone files from github , update directory permissions. Later working directory is confirmed before setting up the network and volume for data persistence.

2. After network is setup the next role to be executed is the database.

3. Backend which depends on the database is executed .

4. Finally after network, database and backend configuration, frontend or client side is configured.

This sequential order ensures that the necessary environment, dependencies, and services are available before each dependent role executes. The modules used are primarily focused on Docker management to create, configure, and start containers for each component of the YOLO e-commerce application.

