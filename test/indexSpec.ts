/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../index.ts" />

import RS    = require('../index');
var Request  = RS.Roses.Request;
var Response = RS.Roses.Response;
var url = require('url');

describe("Roses.Request", ()=>{

    // when url has query
    it('can parse method of http request and query as obj', ()=>{
        var request = new Request({ 'method': 'GET', 'url': 'http://hogehoge.com/hoge?user=mogemoge', headers: {'content-type': 'application/json'} });

        expect(request.method).toEqual('GET');
        expect(request.urlObject.query.user).toEqual('mogemoge');
    });

    //when url does not have a query
    it('can parse method. but query must be void hash', ()=>{
        var request = new Request({ method: 'POST', 'url': 'http://mogemoge.com/', headers: {'content-type': 'application/json'} });

        expect(request.method).toEqual('POST');
        expect(request.urlObject.query).toEqual({});
    });
});

describe("Roses.Response", ()=> {
    // #new
    it('takes any object as an argument of its constructor', ()=>{
        var obj      = { foo: 'var' };
        var response = new Response(obj);

        expect(response.rawResponse).toEqual(obj);
    });
});
