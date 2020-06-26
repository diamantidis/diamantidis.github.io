---
layout: tips
title: Serve your local website or service on HTTPS with mkcert
description: How to use mkcert to generate locally-trusted SSL certificates to serve a website on HTTPS
date: 2020-06-26 06:00 +0200
tags: ["Command Line"]
image:
    path: /assets/social/tips/serve-localhost-website-on-https-with-mkcert.png
    width: 1024
    height: 428
twitter:
    card: summary_large_image
---

When working on a website or a service, the development environment should imitate as much as possible the production one. And since most production websites and services are served on HTTPS, the same should happen for the development versions as well. This is exactly what [mkcert] is trying to solve. 

[mkcert] is a tool that makes it easy to generate locally-trusted SSL certificates signed by a local CA (Certificate Authority).

On macOS, you can use Homebrew to install the tool: 
```bash
# Install on macOS
brew install mkcert
# Generate and install a local CA
mkcert -install
# Create a new certificate
mkcert -key-file key.pem -cert-file cert.pem localhost
```

Now you can use the SSL key and cert for your local server. For instance, if you have a Jekyll blog, you can use the following command to serve on HTTPS
```bash
jekyll server --ssl-cert ./cert.pem --ssl-key ./key.pem
```

Now, you can browse your local Jekyll site on [`https://localhost:4000`](https://localhost:4000)! :tada:

[mkcert]: https://github.com/FiloSottile/mkcert