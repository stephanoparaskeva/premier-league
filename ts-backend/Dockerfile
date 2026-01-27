FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY tsconfig.json ./
COPY src ./src
COPY clubs.json matches.json ./

ENV PORT=8000
EXPOSE 8000

RUN npm run build

CMD ["npm","run","start"]
