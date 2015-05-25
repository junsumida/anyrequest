/// <reference path="./typings/node/node.d.ts" />
/// <reference path="./typings/underscore/underscore.d.ts" />
/// <reference path="./typings/urijs/URI.d.ts" />

import _ = require("underscore");
var URI  = require("URIjs"); // FIXME

class Request {
    private rawRequest: any;
    private rawBody:    string;
    private chunk:      any[] = [];

    constructor(request: any) {
        this.rawRequest = request;
        this.parseRawRequest();
    }

    public method: string;
    public url:    any;
    public body:   Object;

    public path: string;

    public urlParams: Object;

    public pushChunk(chunk: any) {
        this.chunk.push(chunk);
    }

    private parseRawRequest() {
        this.method    = this.rawRequest.method;
        this.url       = URI.parse(this.rawRequest.url);
        this.urlParams = this.url.parts
    }

    public parseRequestBody() {
        var data     = Buffer.concat(this.chunk);
        this.rawBody = data.toString();
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
var server = http.createServer((req, res)=>{

    var request  = new Request(req);
    var response = new Response(res);

    req.on('data', (chunk)=>{
        request.pushChunk(chunk);
    });

    req.on('end', ()=>{
        try {
            request.parseRequestBody();
            response.body = JSON.stringify(request.body);
        } catch (e) {
            console.log(e);
        } finally {
            response.render();
        }
    })

});
server.listen(8080);
console.log('Sever starts.');
