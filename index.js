/// <reference path="./typings/node/node.d.ts" />
/// <reference path="./typings/underscore/underscore.d.ts" />
/// <reference path="./typings/urijs/URI.d.ts" />
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
        this.body = 'hello. typescript!';
        this.response = response;
    }
    Response.prototype.render = function () {
        this.response.statusCode = 200;
        this.response.setHeader('Content-type', 'text/plain');
        this.response.write(this.body);
        this.response.end();
    };
    return Response;
})();
var http = require('http');
var server = http.createServer(function (req, res) {
    var request = new Request(req);
    var response = new Response(res);
    req.on('data', function (chunk) {
        request.pushChunk(chunk);
    });
    req.on('end', function () {
        try {
            request.parseRequestBody();
            response.body = JSON.stringify(request.body);
        }
        catch (e) {
            console.log(e);
        }
        finally {
            response.render();
        }
    });
});
server.listen(8080);
console.log('Sever starts.');
//# sourceMappingURL=index.js.map