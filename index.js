require('dotenv').config();
const app = require('./src/app');
const config = require('./configs/index.config')
const createServer = require('http');
const server = createServer.createServer(app);
server.requestTimeout = 60000;
server.headersTimeout = 60000;

server.listen(config.PORT, ()=>{
    console.log("server starts on port " + config.PORT)
})