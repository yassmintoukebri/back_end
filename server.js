const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3029;
console.log("Server is listening on port 3029.");

const server = http.createServer(app);
server.listen(port);