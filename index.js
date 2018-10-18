const http = require('http');
const request = require('request');
const httpProxy = require('http-proxy');

const server = http.createServer((req, res) => {
    const target = process.env.PROXIED_URL || 'http://localhost:9008';
    const proxy = httpProxy.createProxyServer({
        selfHandleResponse: true,
        secure: false,
        xfwd: true
    });
    proxy.on('proxyReq', (proxyReq, req, res) => {
        proxiedReq = proxyReq;
    });
    proxy.on('proxyRes', (proxyRes, req, res) => {
        if (req.method === 'HEAD' && proxyRes.statusCode !== 200) {
            request({
                url: `${target}${req.url}`,
                headers: req.headers
            })
                .on("response", (getResponse) => {
                    res.writeHead(getResponse.statusCode, getResponse.headers);
                    res.end();
                });
        } else {
            proxyRes.pipe(res);
        }
    });
    proxy.web(req, res, { target });
});

if (!process.env.PROXIED_URL) {
    // Test server that returns 404 on HEAD requests
    http.createServer(function (req, res) {
        if (req.method === 'HEAD') {
            res.writeHead(404, {});
            res.end();
        } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2));
            res.end();
        }
    }).listen(9008);
}

server.listen(process.env.PORT || 5050);
