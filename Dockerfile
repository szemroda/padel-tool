FROM node:24-slim AS base

ARG TZ=Europe/Warsaw
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install Chromium and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and others)
RUN apt-get update \
    && apt-get install -y wget gnupg chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set timezone
RUN apt-get update \
    && apt-get install -y --no-install-recommends tzdata \
    && ln -sf /usr/share/zoneinfo/${TZ} /etc/localtime \
    && echo "${TZ}" > /etc/timezone \
    && dpkg-reconfigure -f noninteractive tzdata \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
ENV TZ=${TZ}

# Add user
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads

# Set the working directory in the container
WORKDIR /home/pptruser




FROM base AS install
COPY package*.json ./

# Install app dependencies and change the ownership of the node_modules directory
RUN npm ci



FROM base AS prerelease
COPY --from=install /home/pptruser/node_modules ./node_modules
RUN chown -R pptruser:pptruser /home/pptruser/node_modules

# Copy the rest of the app source code to the working directory
COPY . .

# Change the ownership of the app files excluding node_modules
RUN find /home/pptruser -path /home/pptruser/node_modules -prune -o -exec chown pptruser:pptruser {} +




FROM prerelease AS run
USER pptruser

# Start the app
ENTRYPOINT [ "npm", "start" ]
