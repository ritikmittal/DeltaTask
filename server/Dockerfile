FROM node:14.7.0-alpine3.10

COPY ./server/* /home/node/app/

RUN npm install -g nodemon
ENTRYPOINT npm start
