/// <reference path="./typings/node/node.d.ts" />
/// <reference path="./typings/underscore/underscore.d.ts" />
/// <reference path="./typings/socket.io/socket.io.d.ts" />
var socket_io = require("socket.io");
var events = require("events");
var EventEmitter = events.EventEmitter;
var url = require("url");
var Roses;
(function (Roses) {
    var Request = (function () {
        function Request(request) {
            this.dataBuffer = [];
            this.rawRequest = request;
            this.method = this.rawRequest.method;
            this.urlObject = url.parse(this.rawRequest.url, true);
        }
        Request.prototype.parseRequestBody = function () {
            this.body = JSON.parse(Buffer.concat(this.dataBuffer).toString());
        };
        return Request;
    })();
    Roses.Request = Request;
})(Roses = exports.Roses || (exports.Roses = {}));
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
    function Router(request, response) {
        if (request.urlObject.pathname === '/') {
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
    var request = new Roses.Request(req);
    var response = new Response(res);
    req.on('data', function (chunk) {
        request.dataBuffer.push(chunk);
    });
    req.on('end', function () {
        var router = new Router(request, response);
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