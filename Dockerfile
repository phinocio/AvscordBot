FROM node:lts-alpine3.18 as app

WORKDIR /app

COPY package*.json /app/
RUN npm ci

# RUN apk add --no-cache curl

COPY . .
