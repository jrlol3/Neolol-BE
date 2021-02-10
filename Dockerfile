FROM node:12
RUN npm install pm2 -g
RUN apt-get update || : && apt-get install python -y

# Installing dependencies
COPY package*.json ./
RUN npm ci

# Copying source files
COPY . .