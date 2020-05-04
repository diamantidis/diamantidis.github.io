---
layout: post
title: Download provision profiles with AppleScript
description: How to use AppleScript, or other Open Scripting Architecture(OSA) languages, like JavaScript, to automate downloading provision profiles from Xcode
date: 2018-11-25 08:00 +0200
comments: true
tags: [AppleScript, Xcode, JavaScript, OSA]
---

In my try to empty my To-do list, one item that caught my attention and I decided to give it a try is Applescript.

Applescript is a scripting language that allows us to interact with applications and many parts of the Mac OS.
Well, with applescript you can automate pretty much anything on a Mac OS.

AppleScript is an English-like language which contains words that are used in the every-day life thus making the writing of a script feels like creating a normal sentence. Due to that, it is quite easy to write, read and understand.

A few examples of what can be implemented with applescript are the following:

- Show notification 
- Turn sound on and off
- Open a program or a file with a specific program
- Send an email with the Mail app
- Empty the trash 

An `AppleScript` script can be written and run using the `Script Editor` application. Alternatively, the `osascript` command can be used to run the Applescript "script" like for example `osascript -e 'display notification "hello world!"'`

## Osascript

Osascript is a tool to run any script in an OSA(Open Scripting Architecture) language. More info about OSA can be found [here](https://developer.apple.com/library/archive/documentation/AppleScript/Conceptual/AppleScriptX/Concepts/osa.html).

To find out which OSA languages are installed on your system, you can run the `osalang` command. Two of the most popular such languages are `AppleScript` and `javascript`. The script can either be plain text or a compiled script (.scpt) created by Script Editor or `osacompile` command.
Plain text will be treated as Applescript, unless it is stated differently using the `-l` option. For more info about `osacript` you can refer to it's [man page](https://ss64.com/osx/osascript.html).


## A "real world" example
One of the tasks that I found interesting, is to automate the process needed to download and update the provisioning profiles in Xcode.

The process can be described with the following steps:
- Open Xcode
- From the navigation menu, choose Preferences or alternative `Command` + `,`. A new dialog opens.
- Press the option "Accounts" from the the toolbar. The new window contains a list of all the appleIds on the left and details for each of them on the right.
- Press the appleId that you want. It opens the details.
- On the bottom right corner of the right pane, there is a button "Download Manual Profiles"
- Press the button


## Implementation with Javascript
First I start doing the implementation with Javascript, to get a better idea on how it is working.

The javascript implementation is the following:
{% gist 0d2a9e28c12d2f1b3d3c02e7f32c7019 javascript_download_profiles.scpt %}

This can be executed by running `osascript javascript_download_profiles.scpt`.
I would say that the documentation was not so good and there are not so many examples available online.

The library documentation can be found by pressing `Shift` + `Command` + `L` when using the 
`Script Editor`. It contains documentation for both Javascript and Applescript and how to use them to communicate with a lot of Mac OS apps.

![script editor's documentation screenshot](/assets/applescript/documentation.png)

On the first run of the script, you will get prompted to set Accessibility Access in System Preferences or you will get an error like `... execution error: Error on line X: Error: osascript is not allowed to send keystrokes. (1002)`.

To do so, go to `System Preferences` > `Security & Privacy` > `Privacy` > `Accessibility` and select the programs that you choose to run the script

![Accessibility permissions screenshot](/assets/applescript/accessibility_permissions.png)



## Implementation with Applescript

After facing these issues with Javascript, I was more confident to start the applescript implementation which is the following:

{% gist c688cc192d9d525248f55da6602fb4ad applescript_download_profiles.scpt %}

This can be executed by running `osascript applescript_download_profiles.scpt`.

## Conclusion
It's always nice to experiment with technologies that you haven't use before and at the same time to explore new options and possibilities to make your life easier by enabling you to automate processes. This post only scratches the surface of the applescript capabilities and I am looking forward to start using applescript to automate tasks that I do quite often. Furthermore, it is a great opportunity to get a better idea on how it works underneath with use of the apple events, Open Scripting Architecture and the language components.