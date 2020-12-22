FROM node:alpine AS client
WORKDIR /dest/
COPY client/ .
RUN yarn install --production
RUN yarn build

FROM node:alpine AS server
WORKDIR /app/
COPY package.json yarn.lock ./
RUN yarn install --production
COPY --from=client /dest/build/ ./dest
COPY server.js .
CMD ["yarn", "run", "server"]
