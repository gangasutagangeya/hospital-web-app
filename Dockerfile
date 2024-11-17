# base node image
FROM node:20-bookworm-slim as base

# install openssl and sqlite3 for prisma
# ffmpeg for the call kent functionality
# ca-certificates and fuse for litefs
# procps for "tops" command to see which processes are hogging memory (it's node)
# python & make for node-gyp
RUN apt-get update && apt-get install -y openssl sqlite3

# Install all node_modules, including dev dependencies
FROM base as deps

RUN mkdir /app/
WORKDIR /app/

ADD package.json package-lock.json .npmrc ./
RUN npm install

# Setup production node_modules
FROM base as production-deps

ENV NODE_ENV = production

RUN mkdir /app/
WORKDIR /app/

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json .npmrc /app/
RUN npm prune --omit=dev

# Build the app
FROM base as build

RUN mkdir /app/
WORKDIR /app/

COPY --from=deps /app/node_modules /app/node_modules

ADD prisma /app/prisma

RUN npx prisma generate

# app code changes all the time
ADD . .
RUN npm run build

# build smaller image from running
FROM base

ENV NODE_ENV="production"

# For WAL support: https://github.com/prisma/prisma-engines/issues/4675#issuecomment-1914383246
ENV PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK = "1"

RUN mkdir /app/
WORKDIR /app/

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
COPY --from=build /app/server-build /app/server-build

ADD . .

CMD ["npm","start"]

