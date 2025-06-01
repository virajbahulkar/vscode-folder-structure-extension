FROM node:18

WORKDIR /workspace/extension

COPY ./extension /workspace/extension

RUN npm install
RUN npm run compile
