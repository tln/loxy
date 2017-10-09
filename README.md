# loxy -- a logging proxy

## Usage

```
npm i -g loxy
loxy --target http://localhost:8080 --listen 8081
```

This proxies, while logging request and response headers. I wrote this while 
debugging CloudFront and ELB header interactions.

## Hijack mode

```
sudo loxy --hijack 80
```

`loxy` can hijack existing ports using iptables (linux specific). This isn't
highly tested, beware of running on production machines!

## Testing

Use `docker-compose` to test:

1. `docker-compose run --service-ports loxy`
2. Go to http://localhost:8082 and see nginx test page
3. `loxy --hijack 80`
4. Reload, see nginx test page and loxy outputs the request/response
5. Press ^C to exit loxy
6. Reload, see nginx test page still