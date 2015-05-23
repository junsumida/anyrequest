/// <reference path="./definitely_typed/node/node.d.ts" />
/// <reference path="./definitely_typed/express/express.d.ts" />

class Request {
    private rawRequest: any;
    constructor(request: any) {
        this.rawRequest = request;
        this.parseRawRequest();
    }

    public method: String;
    public path:   String;

    private parseRawRequest() {
        this.method = this.rawRequest.method;
        this.path   = this.rawRequest.url;
    }
}

class Response {
    private response: any;
    constructor(response: any) {
        this.response = response;
    }
    public render() {
        this.response.statusCode = 200;
        this.response.setHeader('Content-type', 'text/plain');
        this.response.write('Hello. TypeScript!');
        this.response.end();
    }
}

var http   = require('http');
var server = http.createServer(function(req, res){

    var request  = new Request(req);
    var response = new Response(res);
    response.render();
});
server.listen(8080);
console.log('Sever starts.');


