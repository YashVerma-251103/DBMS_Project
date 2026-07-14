# node 24, not 20: see backend/Dockerfile — npm 10 rejects this lockfile.

# ── build ────────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Relative base URL: nginx reverse-proxies /api to the backend on the same
# origin, so the built bundle carries no hostname and runs on any host.
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
# CRA promotes lint warnings to errors when CI is set; don't let a warning break the image.
ENV CI=false
RUN npm run build

# ── serve ────────────────────────────────────────────
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
