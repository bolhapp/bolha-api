FROM node:22.7-alpine

WORKDIR /usr/app

COPY ./src ./src 
COPY ./.yarnrc.yml ./.yarnrc.yml 
COPY ./.prettierrc ./.prettierrc 
COPY ./eslint.config.mjs ./eslint.config.mjs 
COPY ./package.json ./package.json 
COPY ./tsconfig.json ./tsconfig.json
COPY ./yarn.lock ./yarn.lock 

# enable yarn 4
RUN corepack enable && \
  yarn set version stable && \
  # install and build
  yarn install && \
  yarn build

# todo split this into 2 stages so this is not needed
RUN rm -rf src tsconfig.json eslint.config.mjs .prettierrc
RUN mv dist/* .

EXPOSE 3000

CMD ["yarn", "start"]
