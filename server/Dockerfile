# Stage 1: Build (Install dependencies)
FROM node:23-slim AS builder

# Set working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

# Copy the rest of the application code
COPY . .

# Stage 2: Runtime
FROM node:23-slim

# Set working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV PRIVATE_DIR=/app/static
ENV DATABASE_DIR=/app/databases
ENV PHOTOS_DIR=/app/photos
ENV WEDDINGDATA_FILE=/app/weddingdata.json

# Expose the application port
EXPOSE 5000

# Define the command to run the application
CMD ["npm", "start"]
