FROM node:latest
WORKDIR /app
COPY . .
COPY /home/ubuntu/* .
RUN npm install
RUN npm run build
CMD [ "npm", "start" ]
