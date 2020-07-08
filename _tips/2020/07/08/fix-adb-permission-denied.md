---
layout: tips
title: How to fix adb's `Permission denied` when copying a file from a device
description: A tip on how to resolve the issue of getting a error with message `Permission denied` when running adb pull.
date: 2020-07-08 06:00 +0200
tags: ["Android"]
image:
    path: /assets/social/tips/fix-adb-permission-denied.png
    width: 891
    height: 512
twitter:
    card: summary_large_image
---


On a recent attempt to pull a realm database file created by an application that I built on my device, I got an error with the following message:

```bash
$ adb pull /data/data/com.example.test/files/default.realm .
adb: error: failed to stat remote object '/data/data/com.example.test/files/default.realm': Permission denied
```

Let's see how we can solve this!

## TLDR

Long story short, you can run the following command from the `Terminal` to create a copy of the file in your machine's file system:
```
adb shell "run-as om.example.test cat /data/data/com.example.test/files/default.realm" > default.realm
```

> This only works for Debug builds and not for a production app.

But let's break it down to pieces!


## Explanation

You can use `adb shell` to connect to the device's shell. 
Then, if you want to access the data of an app with an `applicationId` set to `com.example.test`, you will have to run the command `run-as com.example.test` inside the adb shell.


Once you execute this command, the working directory will change to the `/data/data/com.example.test`. From there, you can use commands like `ls` to get a list of the available directories and `cat` to get the content of a specific file.

The last step (`> default.realm`) is to redirect the content of the file to a file on my machine's file system.



And that's it! Now you will be able to copy the file from a device for an application that you have built without any error!

