# path: ./Dockerfile
FROM node:20-alpine
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json package-lock.json ./
ENV PATH /opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
RUN chown -R node:node /opt/app
USER node
RUN npm install
RUN npm run generate
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]