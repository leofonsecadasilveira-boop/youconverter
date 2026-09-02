FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache qpdf
RUN mkdir -p tmp
COPY package.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
