# ── build ────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── run ──────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

# ponytail: database/ is deliberately NOT copied. Migrations run from the host
# against Supabase (npm run migrate); the SQL has no business in a runtime image.

EXPOSE 5000
CMD ["node", "dist/index.js"]
