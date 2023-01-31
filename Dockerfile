#
# ---- Base Node ----
FROM node:10.15-alpine AS base
# RUN apk add git
# RUN apk add python-dev
#RUN apk update && apk add --virtual build-dependencies build-base git
# install node
#RUN apk add --no-cache nodejs-current tini git npm
# set working directory
WORKDIR /app

# copy project file
# COPY package.json /app/employer-frontend

# COPY tsconfig.json /app/employer-frontend
COPY package.json tsconfig.json ./
#
# ---- Dependencies ----
FROM base AS dependencies
# install node packages
RUN npm set progress=false && npm config set depth 0
#RUN npm install --only=production 
# copy production node_modules aside
#RUN cp -R node_modules prod_node_modules
# install ALL node_modules, including 'devDependencies'
RUN npm install

#
# ---- Build ----
# Run Typescript compile and Babel transpilation
FROM dependencies AS build
COPY . .
#RUN ./node_modules/.bin/tsc -v
# Run Typescript compilation
#RUN ./node_modules/.bin/tsc
RUN npm build
RUN rm -rf /root/.cache
# Transpile using babel
#RUN ./node_modules/.bin/babel dist --out-dir lib

#
# ---- Release ----
#FROM base AS release
# copy production node_modules
#COPY --from=dependencies /app/prod_node_modules ./node_modules
#RUN apk del git npm
# expose port and define CMD
EXPOSE 3000
CMD node server.js --env-file=staging1.env
