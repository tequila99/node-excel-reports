FROM node:12
EXPOSE 14000
WORKDIR /opt/node-report
COPY ./dist .
CMD ['node' 'index.bundle.js']