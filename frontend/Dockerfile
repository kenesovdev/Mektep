FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM alpine:3.20
COPY --from=builder /app/dist /dist
