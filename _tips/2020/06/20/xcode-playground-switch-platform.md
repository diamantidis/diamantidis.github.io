---
layout: tips
title: How to fix Xcode Playground getting stuck on 'Running'
description: A tip describing how changing platform to macOS may fix the issue with Xcode Playground getting stuck on 'Running'
date: 2020-06-20 06:00 +0200
tags: [Xcode]
image:
    path: assets/social/tips/playground_platform_settings.png
    width: 998
    height: 500
twitter:
    card: summary_large_image
---

Sometimes when working on Xcode Playground you may experience some unexpected behavior where Playground gets stuck on 'Running...' without any obvious reason. 🤷:triumph: 

The root cause of this issue is Xcode trying to run the code on a simulator.
By default, when creating a Playground, Xcode will set the platform to iOS and it will open a simulator to run the code. 

So, if you are not working on iOS-specific code, you can solve this by switching the platform on the Playground Settings to `macOS`.

You can change that on the File Inspector tab, which you can either access from the Inspector area or by using the shortcut Command (`⌘`) + Option (`⌥`) + 1.

![Playground platform settings screenshot]({{site.url}}/assets/tips/xcode_playground/playground-platform-settings.png)



With that change in place, your Playground will compile and run successfully :rocket:
