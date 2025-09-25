# your node version
FROM node:20-alpine AS deps-prod

WORKDIR /app

COPY ./package*.json .

RUN npm install --omit=dev

FROM deps-prod AS build

RUN npm install --include=dev

COPY . .

# увеличиваем память для tsc
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run build

FROM node:20-alpine AS prod


WORKDIR /app

COPY --from=build /app/package*.json .
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Устанавливаем переменную окружения для пути к credentials
ENV GOOGLE_APPLICATION_CREDENTIALS="/app/dist/perfect-precept-433720-f3-23d6ba7a783b.json"