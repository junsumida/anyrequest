declare function require(x: string): any;

var http   = require('http');
var server = http.createServer(function(req, res){
    res.statusCode = 200;
    res.setHeader('Content-type','text/plain');
    res.write('Hello, TypeScript!');
    res.end();
});
server.listen(8080);
console.log('Sever starts.');
