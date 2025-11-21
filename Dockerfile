# Build stage
FROM node:20-alpine AS build
WORKDIR /app 

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# Production stage
FROM nginx:1.27-alpine

RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/app.conf

RUN mkdir -p /var/www/app
COPY --from=build /app/dist/ /var/www/app/

EXPOSE 80
