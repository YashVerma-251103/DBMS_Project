# node 24, not 20: package-lock.json (lockfileVersion 3) was authored by npm 11.
# npm 10 (shipped in node:20) resolves the tree differently and `npm ci` fails
# with "Missing: yaml@2.9.0 from lock file". Keep the image's npm >= the one that
# wrote the lock, or regenerate the lock to match.

# ── build ────────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── run ──────────────────────────────────────────────
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

# ponytail: database/ is deliberately NOT copied. Migrations run from the host
# against Supabase (npm run migrate); the SQL has no business in a runtime image.

EXPOSE 5000
CMD ["node", "dist/index.js"]
