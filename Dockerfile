FROM docker pull ghcr.io/puppeteer/puppeteer:23.5.0

ENV PUPPETEER_SKIP-CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY ..
CMD ["node", "index.js"]