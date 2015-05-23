/// <reference path="./definitely_typed/node/node.d.ts" />
/// <reference path="./definitely_typed/express/express.d.ts" />

class Request {
    private rawRequest: any;
    private rawBody:    string;
    constructor(request: any) {
        this.rawRequest = request;
        this.parseRawRequest();
    }

    public method: string;
    public path:   string;
    public body:   Object;

    private parseRawRequest() {
        this.method = this.rawRequest.method;
        this.path   = this.rawRequest.url;
    }

    public parseRequestBody(chunk: any) {
        this.rawBody = chunk.toString();
        this.body    = JSON.parse(this.rawBody);
    }
}

class Response {
    private response: any;
    constructor(response: any) {
        this.response = response;
    }

    public body: string = 'hello. typescript!';

    public render() {
        this.response.statusCode = 200;
        this.response.setHeader('Content-type', 'text/plain');
        this.response.write(this.body);
        this.response.end();
    }
}

var http   = require('http');
var server = http.createServer(function(req, res){

    var request  = new Request(req);
    var response = new Response(res);

    req.on('data', function(chunk){
        request.parseRequestBody(chunk);
        response.body = JSON.stringify(request.body);
        response.render();
    });

});
server.listen(8080);
console.log('Sever starts.');


