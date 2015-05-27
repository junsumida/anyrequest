/// <reference path="./typings/node/node.d.ts" />
/// <reference path="./typings/underscore/underscore.d.ts" />
/// <reference path="./typings/urijs/URI.d.ts" />
/// <reference path="./typings/socket.io/socket.io.d.ts" />
var socket_io = require("socket.io");
var events = require("events");
var EventEmitter = events.EventEmitter;
var URI = require("URIjs"); // FIXME
var Request = (function () {
    function Request(request) {
        this.chunk = [];
        this.rawRequest = request;
        this.parseRawRequest();
    }
    Request.prototype.pushChunk = function (chunk) {
        this.chunk.push(chunk);
    };
    Request.prototype.parseRawRequest = function () {
        this.method = this.rawRequest.method;
        this.url = URI.parse(this.rawRequest.url);
        this.urlParams = this.url.parts;
    };
    Request.prototype.parseRequestBody = function () {
        var data = Buffer.concat(this.chunk);
        this.rawBody = data.toString();
        this.body = JSON.parse(this.rawBody);
    };
    return Request;
})();
var Response = (function () {
    function Response(response) {
        this.body = '<html><header><script src="/socket.io/socket.io.js"></script><script>var socket = io();' + 'socket.on("httpReq", function(msg){' + '   var elem = document.createElement("p");' + '   elem.innerHTML = msg.message;' + '   document.body.appendChild(elem);' + '});</script></header><body></body></html>';
        this.response = response;
    }
    Response.prototype.render = function (router) {
        this.response.statusCode = 200;
        this.response.setHeader('Content-type', router.contentType);
        this.response.write(this.body);
        this.response.end();
    };
    return Response;
})();
var Router = (function () {
    function Router(request) {
        if (request.url.path === '/') {
            this.contentType = 'text/html';
        }
        else {
            this.contentType = 'application/json';
        }
    }
    return Router;
})();
var http_to_sio = new EventEmitter();
var http = require('http');
var server = http.createServer(function (req, res) {
    var request = new Request(req);
    var response = new Response(res);
    req.on('data', function (chunk) {
        request.pushChunk(chunk);
    });
    req.on('end', function () {
        var router = new Router(request);
        try {
            request.parseRequestBody();
            response.body = JSON.stringify(request.body);
            http_to_sio.emit('gotHttpRequest', response.body);
        }
        catch (e) {
            console.log(e);
            if (router.contentType === 'application/json') {
                response.body = JSON.stringify({ "success": 0 });
            }
        }
        finally {
            response.render(router);
        }
    });
});
var io = socket_io.listen(server);
io.sockets.on('connection', function (socket) {
    console.log("server connected");
});
http_to_sio.on('gotHttpRequest', function (msg) {
    console.log(msg);
    io.emit('httpReq', { message: msg });
});
server.listen(8080);
console.log('Sever starts.');
//# sourceMappingURL=index.js.map