FROM node:16 AS BUILD_CLIENT

WORKDIR /app
RUN git clone -b version_2022_10_27 https://github.com/IAmOscar-Liu/automatic-patent-examiner.git react_client
COPY /react_client/package.json ./react_client/package.json 
COPY /react_client/package-lock.json ./react_client/package-lock.json 

WORKDIR /app/react_client
RUN  npm install

WORKDIR /app
COPY /react_client ./react_client

WORKDIR /app/react_client
RUN npm run build
RUN rm -rf node_modules

FROM node:16 AS BUILD_SERVER

ENV NODE_ENV production
# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .
COPY --from=BUILD_CLIENT /app/react_client/build ./public
RUN rm -rf react_client

EXPOSE 5000
CMD [ "node", "index.js" ]