FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++ 

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 5001

ENV NODE_ENV=production
ENV PORT=5001

CMD ["node", "index.js"]
