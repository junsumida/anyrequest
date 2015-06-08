/// <reference path="./typings/node/node.d.ts" />
/// <reference path="./typings/underscore/underscore.d.ts" />
/// <reference path="./typings/socket.io/socket.io.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
            this.contentType = request.headers['content-type'];
            this.method = this.rawRequest.method;
            this.urlObject = url.parse(this.rawRequest.url, true);
            this.bodyParser = new BodyParser(this.contentType, this.method);
        }
        Request.prototype.parseRequestBody = function () {
            this.body = this.bodyParser.parse(this);
        };
        return Request;
    })();
    Roses.Request = Request;
    var BodyParser = (function () {
        function BodyParser(contentType, httpMethod) {
            this.contentType = contentType;
            this.httpMethod = httpMethod;
        }
        BodyParser.prototype.parse = function (request) {
            if (this.httpMethod === 'GET') {
                return request.urlObject.query;
            }
            if (this.httpMethod === 'POST') {
                if (this.contentType === 'application/json') {
                    return JSON.parse(Buffer.concat(request.dataBuffer).toString());
                }
            }
            throw new UnParsableBodyError('content-type: ' + this.contentType + ' httpMethod: ' + this.httpMethod);
        };
        return BodyParser;
    })();
    var Error = (function () {
        function Error() {
        }
        return Error;
    })();
    var UnParsableBodyError = (function (_super) {
        __extends(UnParsableBodyError, _super);
        function UnParsableBodyError(message) {
            this.message = message;
            _super.call(this);
        }
        return UnParsableBodyError;
    })(Error);
    var Response = (function () {
        function Response(response) {
            this.body = '<html><header><script src="/socket.io/socket.io.js"></script><script>var socket = io();' + 'socket.on("httpReq", function(msg){' + '   var elem = document.createElement("p");' + '   elem.innerHTML = msg.method + msg.message;' + '   document.body.appendChild(elem);' + '});</script></header><body></body></html>';
            this.rawResponse = response;
        }
        Response.prototype.render = function (router) {
            this.rawResponse.statusCode = 200;
            this.rawResponse.setHeader('Content-type', router.contentType);
            this.rawResponse.write(this.body);
            this.rawResponse.end();
        };
        return Response;
    })();
    Roses.Response = Response;
})(Roses = exports.Roses || (exports.Roses = {}));
var Router = (function () {
    function Router(request, response) {
        if (request.urlObject.pathname === '/') {
            this.contentType = 'text/html';
            this.isViewerMode = true;
        }
        else {
            this.contentType = 'application/json';
            this.isViewerMode = false;
        }
    }
    Router.prototype.apply = function (route, callback) {
    };
    Router.prototype.dispatch = function () {
    };
    return Router;
})();
var http_to_sio = new EventEmitter();
var http = require('http');
var server = http.createServer(function (req, res) {
    var request = new Roses.Request(req);
    var response = new Roses.Response(res);
    req.on('data', function (chunk) {
        request.dataBuffer.push(chunk);
    });
    req.on('end', function () {
        var router = new Router(request, response);
        try {
            request.parseRequestBody();
            if (!router.isViewerMode) {
                response.body = JSON.stringify(request.body);
                http_to_sio.emit('gotHttpRequest', response.body, request.method);
            }
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
http_to_sio.on('gotHttpRequest', function (msg, method) {
    console.log(msg);
    io.emit('httpReq', { message: msg, method: method });
});
server.listen(8080);
console.log('Sever starts.');
//# sourceMappingURL=index.js.map