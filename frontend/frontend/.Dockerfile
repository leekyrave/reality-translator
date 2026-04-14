FROM node:22-alpine as builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline

COPY / ./
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN --mount=type=cache,target=/usr/src/app/node_modules/.vite \
    npm run build

FROM nginx:alpine as production
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY /conf.d /etc/nginx/conf.d/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]