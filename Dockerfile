FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm i

COPY . .

RUN npm run build

EXPOSE 5000
CMD ["node", "dist/index.js"]