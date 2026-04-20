# Build stage
FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# MUST BE DECLARED DURING# Provide ALB DNS here for production!
ENV VITE_API_URL=http://3.109.152.88:5000
ENV VITE_AWS_REGION=ap-south-1
ENV VITE_AWS_S3_BUCKET_NAME=cloud-project-s3-unique

RUN npm run build

# Serve stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Add custom nginx config for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]