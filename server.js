#!/usr/bin/env node
var argv = require('yargs')
  .option('listen', {description: "port to listen on", number: true, default: 8081})
  .option('target', {description: "url to proxy to", default: 'http://localhost:8080/'})
  .option('hijack', {description: "hijack port on localhost", number: true})
  .argv;
var httpProxy = require('http-proxy');
var colors = require('colors/safe');
var child_process = require('child_process');

// Ensure ^C routes through exit
process.on('SIGINT', () => process.exit());

// Returns whether the command worked
function iptables(args) {
  console.log(colors.green(`Running: iptables ${args.join(' ')}`));
  var proc = child_process.spawnSync('iptables', args);
  if (proc.status) {
    console.error(colors.red(`Error:`), proc.status, ''+proc.stdout, ''+proc.stderr);
    return false;
  } else {
    return true;
  }
}

if (argv.hijack) {
  var iptableArgs = ['-t', 'nat', '-A', 'PREROUTING', '!', '-s', '127.0.0.1', '-p', 'tcp', '--dport', argv.hijack, '-j', 'REDIRECT', '--to-port', argv.listen];
  if (iptables(iptableArgs)) {
    iptableArgs[2] = '-D';
    process.on('exit', () => iptables(iptableArgs));
    argv.target = 'http://localhost:' + argv.hijack;
  } else {
    process.exit(1);
  }
}

var transactionID = 1;

var proxy = httpProxy.createProxyServer({
  target: argv.target
});
proxy.on('proxyReq', function(proxyReq, req, res, options) {
  req.transactionID = transactionID++;
  console.log(colors.blue(`[Req${req.transactionID}]`), req.method, req.url, req.headers);
});
proxy.on('proxyRes', function(res, req) {
  console.log(colors.yellow(`[Res${req.transactionID}]`), res.statusCode, res.headers);
});
proxy.listen(argv.listen);
console.log(colors.green(`Listening on ${argv.listen} proxying to ${argv.target}`));
