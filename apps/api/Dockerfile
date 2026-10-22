# Build from the repository root: docker build -f apps/api/Dockerfile .
FROM node:24.16.0-alpine3.22 AS base
RUN corepack enable
WORKDIR /repo

# Keep only what @opsell/api needs, so unrelated changes do not bust the install cache.
FROM base AS prune
COPY . .
RUN pnpm dlx turbo@2.11.7 prune @opsell/api --docker

FROM base AS build
COPY --from=prune /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prune /repo/out/full/ .
RUN pnpm turbo run build --filter=@opsell/api

# The bundle is self-contained: the image holds Node, dist/ and the migrations.
FROM node:24.16.0-alpine3.22
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/packages/db/drizzle ./drizzle
USER node
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=3s CMD wget -qO- http://127.0.0.1:${API_PORT:-4000}/healthz || exit 1
# Run `node --enable-source-maps dist/migrate.mjs` as the owner role before each release.
CMD ["node", "--enable-source-maps", "dist/main.mjs"]
