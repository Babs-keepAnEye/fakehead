fakehead
========
This is an HTTP proxy server that will provide support for `HEAD` in case the backend server was not properly implemented.  It does this by retrying `HEAD` requests that do not result in a successful response as a `GET` request and pass the header data back to the client.

    docker run --rm -e PROXIED_URL=https://myproxyserver:8080 -p 5050:5050 trajano/fakehead 

## Note

`PROXIED_URL` must not end with a `/` as the URI being passed to it will contain the leading `/`.  Not specifying the PROXIED_URL will start up a demo proxy server on port 9008.

`PORT` can be set to override the default port.

I basically wrote this as a workaround for [NEXUS-12684](https://issues.sonatype.org/browse/NEXUS-12684) which has been open for over a year now.