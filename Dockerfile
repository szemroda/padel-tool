# Use the official Node.js image as the base image
FROM node:18-slim
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install Chromium and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and others)
RUN apt-get update \
    && apt-get install -y wget gnupg chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Add user so we don't need --no-sandbox.
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /node_modules \
    && chown -R pptruser:pptruser /package.json \
    && chown -R pptruser:pptruser /package-lock.json

# Copy the rest of the app source code to the working directory
COPY . .

USER pptruser

# Start the app
CMD [ "npm", "start" ]
