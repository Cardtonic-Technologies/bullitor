FROM node:20-alpine as build
WORKDIR /app
RUN apk add --no-cache openssh git
COPY package* ./
RUN npm install --omit=dev
#COPY dist ./

FROM node:20-alpine
# https://stackoverflow.com/questions/66963068/docker-alpine-executable-binary-not-found-even-if-in-path
RUN apk add --no-cache libc6-compat curl bash
ARG BUILD_VERSION
ARG LOG_LEVEL=info
ARG LOG_LABEL=bullitor
ARG ALTERNATE_PORT=8081
ARG PORT=3000
WORKDIR /app
COPY --from=build /app ./
COPY docker-entrypoint.sh .
RUN npm run build
ENV NODE_ENV="production" \
    ALTERNATE_PORT=$ALTERNATE_PORT \
    PORT=$PORT \
    LOG_LEVEL=$LOG_LEVEL \
    LOG_LABEL=$LOG_LABEL \
    VERSION=$BUILD_VERSION
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=30s --start-period=5s --retries=3 CMD curl --fail http://localhost:3000/healthcheck || exit 1
ENTRYPOINT ["bash", "docker-entrypoint.sh"]

CMD ["node", "daemon.js"]
