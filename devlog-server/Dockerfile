# syntax=docker/dockerfile:1

FROM node:20.20-bookworm-slim AS base
RUN apt-get update \
    && apt-get install -y --no-install-recommends libcurl4 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./

FROM base AS development-dependencies
RUN npm ci \
    && chown -R node:node /app

FROM development-dependencies AS development
ENV NODE_ENV=development
COPY --chown=node:node . .
USER node
EXPOSE 5050
CMD ["npm", "run", "dev"]

FROM development AS test
ENV NODE_ENV=test
CMD ["npm", "test"]

FROM base AS production-dependencies
ENV NODE_ENV=production
RUN npm ci --omit=dev \
    && npm cache clean --force

FROM node:20.20-bookworm-slim AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package*.json openapi.yaml ./
COPY --chown=node:node src ./src
USER node
EXPOSE 5050
CMD ["npm", "start"]
