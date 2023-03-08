FROM node:16.14

WORKDIR /app

COPY ./package*.json ./
RUN npm install
# COPY ./public/* ./public
COPY ./src ./src

CMD ["node","src/index.js"]