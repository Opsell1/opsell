# Build from the repository root: docker build -f apps/console/Dockerfile .
FROM node:24.16.0-alpine3.22 AS base
RUN corepack enable
WORKDIR /repo
ENV NEXT_TELEMETRY_DISABLED=1

# Keep only what @opsell/console needs, so unrelated changes do not bust the install cache.
FROM base AS prune
COPY . .
RUN pnpm dlx turbo@2.11.7 prune @opsell/console --docker

FROM base AS build
COPY --from=prune /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prune /repo/out/full/ .
RUN pnpm turbo run build --filter=@opsell/console

# Next.js standalone output; API_URL is read at runtime, so one image serves every environment.
FROM node:24.16.0-alpine3.22
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /repo/apps/console/.next/standalone ./
USER node
EXPOSE 3000
CMD ["node", "apps/console/server.js"]
