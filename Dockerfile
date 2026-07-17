FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS release
ENV NODE_ENV=production
COPY --from=build /app/.output ./.output

EXPOSE 3000

ENTRYPOINT ["bun", "run", ".output/server/index.mjs"]
