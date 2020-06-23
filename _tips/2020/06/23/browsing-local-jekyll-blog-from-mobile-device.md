---
layout: tips
title: Browsing a local Jekyll blog from your mobile device
description: How to view your Jekyll site running on localhost from your mobile device on the same network
date: 2020-06-23 06:00 +0200
tags: [Jekyll]
image:
    path: /assets/social/tips/local-jekyll-blog-on-mobile-device.png
    width: 768
    height: 512
twitter:
    card: summary_large_image
---

The command `jekyll server`, by default, binds to `127.0.0.1`, as you can see in the following logs.

```sh
$ jekyll serve
[...]
Server address: http://127.0.0.1:4000/
Server running... press ctrl-c to stop.
```

This means that the website is only accessible by the device that you are running the command.

To make the website accessible by other devices on the same network, run `jekyll serve --host=0.0.0.0`. 

```sh
$ jekyll serve --host=0.0.0.0
[...]
Server address: http://0.0.0.0:4000/
Server running... press ctrl-c to stop. 
```

This will make the Jekyll blog accessible by the IP address of your machine, and thus accessible by other devices on the same network.

A neat command that you can use to find the IP address of your machine is the following:

```sh
ifconfig en0 | grep "inet " | awk '{print $2}'
```

This will output your IP on the Terminal in the format `192.168.0.XXX`. 

Type this IP followed by `:4000` on your favorite browser and you will be able to now browse your blog from the mobile device!! :rocket: