#!/usr/bin/env node
var argv = require('yargs')
  .option('listen', {description: "port to listen on", number: true, default: 8081})
  .option('target', {description: "url to proxy to", default: 'http://localhost:8080/'})
  .argv;
var transactionID = 1;
var httpProxy = require('http-proxy');
var colors = require('colors/safe');

var proxy = httpProxy.createProxyServer({
  target: argv.target
});
proxy.on('proxyReq', function(proxyReq, req, res, options) {
  req.transactionID = transactionID++;
  console.log(colors.blue(`[Req${req.transactionID}]`), req.method, req.url, req.headers);
});
proxy.on('proxyRes', function(err, req, res) {
  console.log(colors.yellow(`[Res${req.transactionID}]`), res.statusCode, res.headers);
});
proxy.listen(argv.listen);
console.log(colors.green(`Listening on ${argv.listen} proxying to ${argv.target}`));
