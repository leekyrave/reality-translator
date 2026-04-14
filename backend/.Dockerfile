FROM node:22-slim as deps

WORKDIR /usr/src/app
COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline

#FROM node:22-slim as dev
#WORKDIR /usr/src/app
#COPY --from=deps /usr/src/node_modules ./node_modules
#COPY ./package*.json ./
#COPY / ./
#
#RUN npm run build

FROM node:22-slim as builder

WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY / ./
RUN npm run build

FROM node:22-slim as production
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

RUN npm ci --omit=dev

CMD ["node", "dist/main.js"]