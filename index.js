/// <reference path="./definitely_typed/node/node.d.ts" />
/// <reference path="./definitely_typed/express/express.d.ts" />
var Request = (function () {
    function Request(request) {
        this.rawRequest = request;
        this.parseRawRequest();
    }
    Request.prototype.parseRawRequest = function () {
        this.method = this.rawRequest.method;
        this.path = this.rawRequest.url;
    };
    return Request;
})();
var Response = (function () {
    function Response(response) {
        this.response = response;
    }
    Response.prototype.render = function () {
        this.response.statusCode = 200;
        this.response.setHeader('Content-type', 'text/plain');
        this.response.write('Hello. TypeScript!');
        this.response.end();
    };
    return Response;
})();
var http = require('http');
var server = http.createServer(function (req, res) {
    var request = new Request(req);
    var response = new Response(res);
    response.render();
});
server.listen(8080);
console.log('Sever starts.');
//# sourceMappingURL=index.js.map