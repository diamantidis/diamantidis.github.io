---
layout: post
title: Quick and simple load testing with Apache Bench
description: A brief into to Apache Bench, how to use, available option and result interpretation
date: 2020-07-15 06:00 +0200
tags: ["Performance"]
image:
    path: /assets/social/load-testing-with-apache-bench.png
    width: 1024
    height: 512
twitter:
    card: summary_large_image
---

[Apache Bench] or ab for short, is a command-line tool to perform simple load tests on an HTTP server, be it a website or an API.

By running the following command, you will get an overview of how the server is performing under load:

```sh
ab -n 100 -c 10 <url>
```

So, in this post, I will try to explain how we can use Apache Bench. I will start with how to install it, then proceed on how to use it and the available options, and finally, I explain how to interpret the results.

Let's get started!

## Installation
One of the advantages of Apache Bench is that you may already have `ab` installed, depending on the OS you are using.
For macOS users, it comes pre-installed by default, and if you are using a Linux Distribution, there are a lot of chances that it is also installed as it comes with the `httpd` package. Try to run `ab -help` to verify if that's the case.

In case it is not installed, you will need to install the `apache2-utils` package.
For example, if you are using `Ubuntu` you will have to run:

```bash
apt-get update
apt-get install apache2-utils
```

So, now, that we have Apache Bench installed, let's see how we can use it and some of the available options.

## Usage

The simplest possible way to use Apache Bench is by running `ab <url>`. This command will perform a single network request, but this is not exactly what we would call "load". For this reason, Apache Bench comes with a plethora of options you can use to define more complex use cases.

Some of the most useful ones are the following:

* `-n`: Number of requests
* `-c`: Number of concurrent requests
* `-H`: Add header
* `—r`: flag to not exit on socket receive errors
* `-k`: Use HTTP KeepAlive feature
* `-p`: File containing data to POST
* `-T`: Content-type header to use for POST/PUT data,

Now you can use those options like so:

```bash
ab -n 100 -c 10 -H "Accept-Encoding: gzip, deflate" -rk https://0.0.0.0:4000/
```

> :warning: Please note that you need the trailing `/` on the URL, or else you will get the error message `ab: invalid URL`.

If you want to perform a benchmark test for a POST request, you can run the following command:

```bash
ab -n 100 -c 10 -p data.json -T application/json -rk https://0.0.0.0:4000/
```

> :bulb: TIP: For a full list of options, you can run `ab -help`, refer the man page by running `man ab`, or visit the [documentation] online.

Let's now see how the output would look like and how to interpret it!

## Response interpretation

Once `ab` completes the HTTP requests, it will generate an output that will look like the following snippet:

```
Concurrency Level:      10
Time taken for tests:   0.791 seconds
Complete requests:      1000
Failed requests:        0
Keep-Alive requests:    1000
Total transferred:      4649081 bytes
HTML transferred:       3934000 bytes
Requests per second:    1264.17 [#/sec] (mean)
Time per request:       7.910 [ms] (mean)
Time per request:       0.791 [ms] (mean, across all concurrent requests)
Transfer rate:          5739.47 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    1   9.4      0     105
Processing:     3    6   7.1      5      77
Waiting:        3    6   6.8      5      65
Total:          3    7  11.9      5     111

Percentage of the requests served within a certain time (ms)
  50%      5
  66%      6
  75%      6
  80%      6
  90%      7
  95%      8
  98%     62
  99%     77
 100%    111 (longest request)
```

In this first section, you can find some useful information like, for example, that the number of `Complete requests` was 1000 and the `Concurrency Level` was 10. Furthermore, you can see that it performed 1264.17 `Requests per second`.

In the `Connection Times` section, you can see that the fastest request took 3 ms (`Total` row and `min` column), the slowest took 111 ms (`Total` row and `max` column), while the mean was 7 ms (`Total` row & `mean` column).

In the last section, you get an overview of the response times in a cumulative distribution. In this example, we can see that 95% of requests took 8 ms or less to complete and that total response times of more than 100 ms is an outlier as it covers less than 1% of the sample.

## Conclusion

And that's about for this intro on Apache Bench! By now, you should be able to use the `ab` command to perform load tests on an HTTP server and get some insights from the results.

In the end, I would say that Apache Bench is an ideal solution if you want to perform a quick load test since it is probably already installed on your machine and it is really simple to use. In case you want to cover more advanced use cases like flows and random URL entries, then I think that there are other more modern and feature-complete tools. A few examples are [JMeter], [K6] and [Gatling].

Thanks for reading, I hope that you find this post useful, and if you have any questions or comments about this post, feel free to reach out to me on [Twitter]!

Until next time!

[Apache Bench]: https://httpd.apache.org/docs/2.4/programs/ab.html
[documentation]: https://httpd.apache.org/docs/2.4/programs/ab.html

[JMeter]: https://jmeter.apache.org/
[K6]: https://k6.io/
[Gatling]: https://gatling.io/

[Twitter]: https://twitter.com/diamantidis_io
