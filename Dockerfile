FROM node:13.8.0-alpine3.11

WORKDIR /app
RUN apk add --no-cache git

COPY package.json .
RUN npm install

COPY tsconfig.json .
COPY src/ src/
RUN npm run build

CMD npm start
