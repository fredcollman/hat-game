FROM node:alpine AS client
WORKDIR /dest/
COPY client/package.json client/yarn.lock ./
RUN yarn install --production
COPY client/ ./
ARG PUBLIC_URL=.
RUN yarn build

FROM node:alpine AS server
WORKDIR /app/
COPY package.json yarn.lock ./
RUN yarn install --production
COPY --from=client /dest/build/ ./client/build/
COPY server.js .

EXPOSE 3001
CMD ["yarn", "run", "server"]
