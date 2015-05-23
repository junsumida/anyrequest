/// <reference path="./definitely_typed/node/node.d.ts" />
/// <reference path="./definitely_typed/express/express.d.ts" />

var http   = require('http');
var server = http.createServer(function(req, res){
    res.statusCode = 200;
    res.setHeader('Content-type','text/plain');
    res.write('Hello, TypeScript!');
    res.end();
});
server.listen(8080);
console.log('Sever starts.');
