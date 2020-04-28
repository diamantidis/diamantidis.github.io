---
layout: post
title: Useful Curl features
description: A list of options when using curl to send API requests to a server from the terminal like timing breakdown, file upload, proxy and url specification
date: 2019-01-06 08:00 +0200
comments: true
tags: [Curl, API, Terminal, File Upload]
---

Happy New Year everyone!! This is my first post of the year!!  
Today's topic is a guide about some of the features of [curl](https://github.com/curl/curl). Curl is a command line tool that can be used to make API requests and generally to transfer data to a URL from the Terminal.

As a developer you will often encounter situations where you will have to communicate with an API to fetch information or do some kind of transaction (create, update, delete, file upload). And curl is a tool to help on these situations. To install curl on a Mac, given that Homebrew is already installed, you just have to run `brew install curl` and then you will be able to run the `curl` command. To get more information about curl, you can refer to curl's man page by typing `man curl` on your terminal. 

> To search for options when using the man command, type `/` followed by the term that you are looking for. For example, to find the occurrences of the word `file`, just type `/file` and then use `n` and `Shift` + `n`, to navigate forth and back respectively.

> If you are using Alamofire to handle the requests, then you can print the curl command of any of them, by just using `debugPrint(request)`, where request is the `Alamofire.request`. More info can be found on [Alamofire's documentation](https://github.com/Alamofire/Alamofire/blob/master/Documentation/Usage.md#customdebugstringconvertible).

> For all the example mentioned in this post, I am using a local Vapor project, with the initial `Todo` endpoints plus some others that I added to present some of the options. I will come back with more about Vapor on a future post. :wink:

So let's start!!!

# Verbose mode

When making a request, sometimes you are not only interested about the content of the response, but maybe also for some other information like the response status or the headers. To get this kind of information, along with a more detailed representation of both the request and the response, you can append your command with the option `-v` or `--verbose`. For example, you can write a command like this, 
```
curl 'http://localhost:8080/todos' -v
```

# Timing breakdown

To get more information on the exact duration that each step of the request takes, like how long it takes until the name resolving is completed, or how long it takes to connect with the server or how long it takes to transfer the information, you can use the option `--write-out` together with the options available like `time_namelookup`, `time_connect`, `time_starttransfer` etc.. 

![Write-out option from man page screenshot]({{site.url}}/assets/curl/write_out_option.png)

As an example you can use this command

```
curl \
--output /dev/null \
--silent \
--write-out 'namelookup:    %{time_namelookup}\nconnect:       %{time_connect}\npretransfer:   %{time_pretransfer}\nstarttransfer: %{time_starttransfer}\ntotal:         %{time_total}\n' \
http://localhost:8080/todos 
```

and the result will be a response like this:

![Write-out output screenshot]({{site.url}}/assets/curl/write_out_output.png)

> The options `--output /dev/null` and `--silent` are used to not show the response of the request and to not show the progress of the request respectively, thus getting a better-looking overview of the information. 


An alternative to using this lengthy command line is to use a file instead. You can create a file with the content of the `--write-out` option and then use this file. 

For example, you can create a file, with the name `curl_format.txt` and the following content:

```
    namelookup:  %{time_namelookup}\n
       connect:  %{time_connect}\n
   pretransfer:  %{time_pretransfer}\n
 starttransfer:  %{time_starttransfer}\n
                    ----------\n
         total:  %{time_total}\n
```

And then run the command:

```
curl \
-o /dev/null \
-s \
-w '@curl_format.txt' \
http://localhost:8080/todos 
```

and you will get a familiar response as before. 

> `-o`, `-s` and `-m` are the single character alternative to `--output`, `--silent` and `--write-out` options


# Proxy 

If you want to pass the request through a proxy, like [Charles](https://www.charlesproxy.com/) you can use the option `-x` or `--proxy`, for example 
```
curl -x http://localhost:8888 http://localhost:8080/todos
```

![man page proxy option screenshot]({{site.url}}/assets/curl/curl_man_proxy_option.png)


# URL options

One of the first topics that the `man curl` command covers is the URL and how this can be formatted. 

![man page url options screenshot]({{site.url}}/assets/curl/curl_man_url_options.png)

With a smart use of this formatting template, you can have a series of numbers as a url param and in this way making the same request multiple times, like in the following example.
Running `curl 'http://localhost:8080/todos?[1-5]'` will result in making 5 requests 

![curl multiple requests screenshot]({{site.url}}/assets/curl/curl_multiple_requests.png)

You can also use these options to make requests to fetch the corresponding information for a list of items, like `curl 'http://localhost:8080/todos/[1-5]'` which will result in 5 requests, one for each id.
It also supports a stepper to the range, like `curl 'http://localhost:8080/todos/[1-5:2]'` to make a request only for the odd numbers.

The results will be:

![curl multiple requests stepper screenshot]({{site.url}}/assets/curl/curl_multiple_requests_stepper.png)

Lastly, you can provide a set of options inside curly brackets, like in the following command

```
curl 'http://localhost:8080/todos/{1,2,4}'
```
which will result in three request for these ids. The values can be alphanumeric, so this can be used with letters or words too, like for example 
```
curl 'http://localhost:8080/todos/{a,b,c}'
```

And also they can be used simultaneously when constructing a url like, `curl 'http://localhost:8080/v[1-2]/todos/{a,b,c}'`, which will result in 6 requests, three for v1 and three for v2.

# File upload

When you want to upload a file you can use the following curl command:
```
curl -X POST \
'http://localhost:8080/upload' \
-H 'Content-Type: multipart/form-data;' \
-F 'image=@image.png;type=image/png;'
```

The `-F` option is used to specify the HTTP multipart POST data and `image` is the name of the field.
Again, a more detailed description about this option can be found on the man page.
![man page form option screenshot]({{site.url}}/assets/curl/curl_man_form_option.png)

## Conclusion

These are a few examples of curl usage that I found useful for me and I want to share as it could come handy for others too. Obviously, there are a lot more options and the way to find them is by searching the man page. 
Hope that you find it useful too, and if want to mention some other options that I haven't mentioned, just let me know on [Twitter](https://twitter.com/diamantidis_io)!!
