# frontend/Dockerfile

# Stage 1: Build the React application
FROM node:23-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

COPY . .

RUN pnpm build

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine

# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built React files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# provide mount point for public data (public photos, app config, public translations)
RUN mkdir /public-data
RUN ln -s /public-data /usr/share/nginx/html/user-data

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
