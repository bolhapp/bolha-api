# Stage 1: Build Stage
FROM node:22.7-alpine AS builder

WORKDIR /usr/src/app

COPY ./src ./src 
COPY ./.yarnrc.yml ./.yarnrc.yml 
COPY ./.prettierrc ./.prettierrc 
COPY ./eslint.config.mjs ./eslint.config.mjs 
COPY ./package.json ./package.json 
COPY ./yarn.lock ./yarn.lock 
COPY ./tsconfig.json ./tsconfig.json

# enable yarn 4
RUN corepack enable && \
  yarn set version stable && \
  # install and build
  yarn install && \
  yarn build

# Stage 2: Production Stage
FROM node:22.7-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy only the necessary files from the build stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist .
COPY --from=builder /usr/src/app/package.json ./package.json

EXPOSE 3000

CMD ["yarn", "start"]
