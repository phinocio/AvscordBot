FROM node:lts-alpine3.23 AS app

WORKDIR /app

RUN npm install -g pnpm@12.8

COPY package.json /app/
COPY pnpm-lock.yaml /app/
RUN pnpm install

COPY . .
