FROM node:13.8.0-alpine3.11

WORKDIR /app

COPY . /app
RUN apk add --no-cache git
RUN npm install
RUN npm run build

CMD npm start