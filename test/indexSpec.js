/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../index.ts" />
var RS = require('../index');
var Request = RS.Roses.Request;
var url = require('url');
describe("Roses.Request", function () {
    // when url has query
    it('can parse method of http request and query as obj', function () {
        var request = new Request({ 'method': 'GET', 'url': 'http://hogehoge.com/hoge?user=mogemoge' });
        expect(request.method).toEqual('GET');
        expect(request.urlObject.query.user).toEqual('mogemoge');
    });
    //when url does not have a query
    it('can parse method. but query must be void hash', function () {
        var request = new Request({ method: 'POST', 'url': 'http://mogemoge.com/' });
        expect(request.method).toEqual('POST');
        expect(request.urlObject.query).toEqual({});
    });
});
//# sourceMappingURL=indexSpec.js.map