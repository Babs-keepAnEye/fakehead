const http = require('http');
const request = require('request');
const httpProxy = require('http-proxy');
const signals = {
    'SIGHUP': 1,
    'SIGINT': 2,
    'SIGTERM': 15
};


const web_o = Object.values(require('http-proxy/lib/http-proxy/passes/web-outgoing'));

const server = http.createServer((req, res) => {
    const target = process.env.PROXIED_URL || 'http://localhost:9008';
    const proxy = httpProxy.createProxyServer({
        selfHandleResponse: true,
        secure: false
    });
    proxy.on('proxyRes', (proxyRes, req, res) => {
        for (var i = 0; i < web_o.length; i++) {
            if (web_o[i](req, res, proxyRes, {})) { break; }
        }
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
            res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2) + '\n');
            req.pipe(res);
            //res.end();
        }
    }).listen(9008);
}

server.listen(process.env.PORT || 5050);

// Do any necessary shutdown logic for our application here
const shutdown = (signal, value) => {
    console.log("shutdown!");
    server.close(() => {
        console.log(`server stopped by ${signal} with value ${value}`);
        process.exit(128 + value);
    });
};

Object.keys(signals).forEach((signal) => {
    process.on(signal, () => {
        console.log(`process received a ${signal} signal`);
        shutdown(signal, signals[signal]);
    });
});