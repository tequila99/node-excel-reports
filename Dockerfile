FROM node:12
EXPOSE 4000
WORKDIR /opt/node-report
COPY ./dist .
CMD ['node' 'index.bundle.js']