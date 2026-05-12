FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
# nginx:alpine автоматически запускает envsubst через /docker-entrypoint.d/
# и рендерит шаблоны из /etc/nginx/templates/ в /etc/nginx/conf.d/
EXPOSE ${NGINX_PORT:-80}
