FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Vazio = same-origin (nginx faz proxy de /api). Em lab local pode passar http://localhost:8080.
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_LEGACY_REMOTE_IMAGES_BASE_URL=https://ebook.alenxandriaglobaltec.com/images
ENV VITE_LEGACY_REMOTE_IMAGES_BASE_URL=$VITE_LEGACY_REMOTE_IMAGES_BASE_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
