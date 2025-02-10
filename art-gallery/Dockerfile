# Use platform-specific base image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install Sharp specifically for ARM64
RUN npm install --platform=linux --arch=arm64 sharp
RUN npm install
RUN npm ci && \
    npm rebuild @tensorflow/tfjs-node --build-from-source 

# System dependencies
RUN apt-get update && \
    apt-get install -y curl tar && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Download model
RUN mkdir -p /usr/src/app/app/utils/arbitrary-image-stylization-v1-tensorflow1-256-v2 && \
    curl -L -o /usr/src/app/app/utils/arbitrary-image-stylization-v1-tensorflow1-256-v2.tar.gz \
    https://www.kaggle.com/api/v1/models/google/arbitrary-image-stylization-v1/tensorFlow1/256/2/download && \
    tar -xvzf /usr/src/app/app/utils/arbitrary-image-stylization-v1-tensorflow1-256-v2.tar.gz -C /usr/src/app/app/utils/arbitrary-image-stylization-v1-tensorflow1-256-v2 && \
    rm /usr/src/app/app/utils/arbitrary-image-stylization-v1-tensorflow1-256-v2.tar.gz

# Copy the rest of the application files into the container
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Specify the command to run your application
CMD ["node", "app.js"]