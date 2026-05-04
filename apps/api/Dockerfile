# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/authz/package.json packages/authz/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/tenant-core/package.json packages/tenant-core/package.json

RUN pnpm install --frozen-lockfile

COPY apps/api apps/api
COPY packages packages
COPY prisma prisma

RUN pnpm prisma:generate
RUN pnpm --filter @polyglot/contracts build
RUN pnpm --filter @polyglot/authz build
RUN pnpm --filter @polyglot/tenant-core build
RUN pnpm --filter @polyglot/api build

FROM node:24-alpine AS runtime

ENV NODE_ENV="production"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /workspace

COPY --from=build /workspace/package.json /workspace/pnpm-lock.yaml /workspace/pnpm-workspace.yaml ./
COPY --from=build /workspace/node_modules node_modules
COPY --from=build /workspace/apps/api apps/api
COPY --from=build /workspace/packages packages
COPY --from=build /workspace/prisma prisma

WORKDIR /workspace/apps/api

EXPOSE 4000

CMD ["node", "dist/main.js"]
