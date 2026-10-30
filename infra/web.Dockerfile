FROM node:24-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
RUN npm ci --ignore-scripts
COPY apps/web apps/web
COPY scripts scripts
COPY specs/cvd-studio/schemas specs/cvd-studio/schemas
RUN npm run build
FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 API_ORIGIN=http://api:8000
COPY --from=build --chown=node:node /app /app
USER node
EXPOSE 3000
CMD ["node","scripts/web_task.mjs","start","--hostname","0.0.0.0"]
