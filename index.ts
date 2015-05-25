/// <reference path="./typings/node/node.d.ts" />
/// <reference path="./typings/underscore/underscore.d.ts" />
/// <reference path="./typings/urijs/URI.d.ts" />
/// <reference path="./typings/socket.io/socket.io.d.ts" />

import _         = require("underscore");
import socket_io = require("socket.io");
import events    = require("events");
var EventEmitter = events.EventEmitter;
var URI          = require("URIjs"); // FIXME

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
        this.urlParams = this.url.parts;
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

    public body: string = '<html><header><script src="/socket.io/socket.io.js"></script><script>var socket = io();' +
        'socket.on("httpReq", function(msg){' +
        '   var elem = document.createElement("p");' +
        '   elem.innerHTML = msg.message;' +
        '   document.body.appendChild(elem);' +
        '});</script></header><body></body></html>';

    public render() {
        this.response.statusCode = 200;
        this.response.setHeader('Content-type', 'text/html');
        this.response.write(this.body);
        this.response.end();
    }
}

var http_to_sio = new EventEmitter();

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
            http_to_sio.emit('gotHttpRequest', response.body);
        } catch (e) {
            console.log(e);
        } finally {
            response.render();
        }
    })

});

var io = socket_io.listen(server);
io.sockets.on('connection', function(socket){
   console.log("server connected");
});

http_to_sio.on('gotHttpRequest', function(msg){
    console.log(msg);
    io.emit('httpReq', {message: msg});
});



server.listen(8080);
console.log('Sever starts.');
