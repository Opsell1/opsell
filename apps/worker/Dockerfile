# Build from the repository root: docker build -f apps/worker/Dockerfile .
FROM node:24.16.0-alpine3.22 AS base
RUN corepack enable
WORKDIR /repo

# Keep only what @opsell/worker needs, so unrelated changes do not bust the install cache.
FROM base AS prune
COPY . .
RUN pnpm dlx turbo@2.11.7 prune @opsell/worker --docker

FROM base AS build
COPY --from=prune /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prune /repo/out/full/ .
RUN pnpm turbo run build --filter=@opsell/worker

# The bundle is self-contained: the image holds only Node and dist/.
FROM node:24.16.0-alpine3.22
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /repo/apps/worker/dist ./dist
USER node
CMD ["node", "--enable-source-maps", "dist/main.mjs"]
