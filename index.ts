/// <reference path="./typings/node/node.d.ts" />
/// <reference path="./typings/underscore/underscore.d.ts" />
/// <reference path="./typings/socket.io/socket.io.d.ts" />

import _         = require("underscore");
import socket_io = require("socket.io");
import events    = require("events");
var EventEmitter = events.EventEmitter;
var url          = require("url");

export module Roses {
    export class Request {
        private rawRequest: any;

        public body       : any;
        public method     : string;
        public contentType: string;
        public urlObject  : any;
        public dataBuffer : any[] = [];

        private bodyParser: BodyParser;

        constructor(request: any) {
            this.rawRequest  = request;

            this.contentType = request.headers['content-type'];
            this.method      = this.rawRequest.method;
            this.urlObject   = url.parse(this.rawRequest.url, true);

            this.bodyParser = new BodyParser(this.contentType, this.method);
        }

        public parseRequestBody() : void {
            this.body = this.bodyParser.parse(this);
        }
    }

    class BodyParser {
        private contentType: string;
        private httpMethod:  string;

        constructor(contentType:string, httpMethod:string) {
            this.contentType = contentType;
            this.httpMethod  = httpMethod;
        }

        public parse(request: Roses.Request) {
            if (this.httpMethod === 'GET') {
                return request.urlObject.query
            }

            if (this.httpMethod === 'POST') {
                if (this.contentType === 'application/json') {
                    return JSON.parse(Buffer.concat(request.dataBuffer).toString());
                }
            }

            throw new UnParsableBodyError('content-type: ' + this.contentType + ' httpMethod: ' + this.httpMethod);
        }
    }

    class Error {
        public message: string;
    }
    class UnParsableBodyError extends Error {
        constructor(message: string) {
            this.message = message;
            super();
        }
    }

    export class Response {
        public rawResponse: any;
        constructor(response: any) {
            this.rawResponse = response;
        }

        public body: string = '<html><header><script src="/socket.io/socket.io.js"></script><script>var socket = io();' +
           'socket.on("httpReq", function(msg){' +
           '   var elem = document.createElement("p");' +
           '   elem.innerHTML = msg.method + msg.message;' +
           '   document.body.appendChild(elem);' +
           '});</script></header><body></body></html>';

        public render(router): void {
            this.rawResponse.statusCode = 200;
            this.rawResponse.setHeader('Content-type', router.contentType);
            this.rawResponse.write(this.body);
            this.rawResponse.end();
        }
    }
}

class Router {
    constructor(request: Roses.Request, response: Roses.Response) {
        if (request.urlObject.pathname === '/') {
            this.contentType  = 'text/html';
            this.isViewerMode = true;
        } else {
            this.contentType  = 'application/json';
            this.isViewerMode = false;
        }
    }

    public apply(route:string, callback: Function):void {
    }

    public dispatch():void {
    }

    private routes: Object;

    public contentType:string;
    public isViewerMode:boolean;
}

var http_to_sio = new EventEmitter();

var http   = require('http');
var server = http.createServer((req, res)=>{

    var request  = new Roses.Request(req);
    var response = new Roses.Response(res);

    req.on('data', (chunk)=>{
        request.dataBuffer.push(chunk);
    });

    req.on('end', ()=>{
        var router = new Router(request, response);

        try {
            request.parseRequestBody();

            if (!router.isViewerMode) {
                response.body = JSON.stringify(request.body);
                http_to_sio.emit('gotHttpRequest', response.body, request.method);
            }
        } catch (e) {
            console.log(e);
            if (router.contentType === 'application/json') {
                response.body = JSON.stringify({"success": 0});
            }
        } finally {
            response.render(router);
        }
    })

});

var io = socket_io.listen(server);
io.sockets.on('connection', function(socket){
   console.log("server connected");
});

http_to_sio.on('gotHttpRequest', function(msg, method:string){
    console.log(msg);
    io.emit('httpReq', {message: msg, method: method});
});

server.listen(8080);
console.log('Sever starts.');
