FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm config set strict-ssl false && npm install --include=dev

COPY . .

EXPOSE 3000
EXPOSE 3001

CMD ["node", "server.js"]
