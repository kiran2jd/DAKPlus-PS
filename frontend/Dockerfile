# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Accept build argument for API URL
ARG VITE_API_BASE_URL=http://localhost:8080/api

COPY package*.json ./
RUN npm install
COPY . .

# Create .env file with the API URL
RUN echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" > .env

RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
