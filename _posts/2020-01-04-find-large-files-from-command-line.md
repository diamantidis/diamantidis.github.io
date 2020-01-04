---
layout: post
title: How to find large files from the command line
description: A post about how to find out which files consume most of the storage disk and how to clean them to recover disk space
date: 2020-01-04 06:00 +0200
comments: true
tags: [Unix, storage, "command line"]
---

Have you ever ran into issues with your storage disk being full?  

Recently I faced this issue on my Mac Book Pro and as result I get a notification like the following:

![Mac Book disk space notification screenshot]({{site.url}}/assets/storage/mac-book-disk-space-notification.png)

But instead of just following the easy solution and moving my `Desktop` and `Download` folder to an external disk, I took this opportunity to delve deeper and find out what actually consume most of the storage disk. 

And this is going to be the topic of this post; I will try to elaborate my process of using a set of commands to find the resources that consume the storage of my Mac Book Pro.

> Disclaimer: This post is meant for Unix System users. Sorry Windows users :)

Let's start with how to find this files!

## How to find files and directories size

A command that we can use to find the disk usage of a file or a directory is `du`. This command comes with a few useful options which you can find by reading the man page (run `man du` on your Terminal). For our scenario, we are going to use two of them; `-a` and `-h`. The option `-a` can be used to display an entry for each file in the directory and `-h` outputs "human-readable" unit suffixes like, for example, `K` and `M` for Kilobytes and Megabytes respectively.

Long story short, if you navigate to a folder using the Terminal, let's say for example your `~/Downloads` folder, and execute the command `du -ah .`, you will get a list of your files and folder inside the `~/Downloads` folder alongside with the info about their disk usage.

Such information is pretty helpful, but it's quite hard to figure out which files are bigger. It would make it much easier if we could sort the output in reverse order, from the biggest file to the smallest. In order to do so, we are going to use the `sort` command. `sort` command also comes with some options that we are going to use; like `-r` for reverse order and `-h` which will take into account the unit suffixes from the `du` command output. 

Now, the command will look like `du -ah . | sort -rh` and voilà; the output is the list of files in descending order based on their disk usage. 

A further nice addition to this command would be some kind of limit on the results of the output. Some times, directories may contain multiple quite small files that will only add noise and make the output much harder to read. Such an example is the `.git` folder.
For this reason, we are going to use the `head` command, which will help us get only the first lines of the input. We are also going to use the `-n` option to limit the output on a specific number of lines.

Finally our command will look like this `du -ah . | sort -rh | head -n 20`. If you try to run it, you will get a list of the twenty biggest files on your current directory. 

## Adding an alias

Let's be honest, remembering this command and the options can be quite hard. Therefore, we can create an alias to this command. 

Based on your Terminal setup, head to the `~/.bashrc` or `~/.zshrc` file. There, we are going to define our alias. I chose `dirinfo` as a name, but feel free to change it if you would like to. In this file, we are going to define a function which will contain a slightly changed version of the command that we previously ran. We are going to use a parameter for the directory argument of the `du` command to make this command a little more flexible. 

```bash
dirinfo()
{
    du -ah "$1" | sort -rh | head -n 20
}
alias dirinfo=dirinfo()
```

Save the changes and run `source ~/.bashrc` or `source ~/.zshrc` or just restart your Terminal. 

By now, you should be able to run commands like `dirinfo ~/Desktop` or `dirinfo .` to get the disk usage information for a specific directory!

So, let's use this command to find which files take the most space.

## Example

As a developer, regardless of the stack, be it iOS, Android, front-end or back-end, it is quite common that the tools that we are using require a decent amount of disk space. 

In my case, my first suspicion was that Xcode and the simulators would occupy a big portion of my storage disk. It was quite easy to validate my assumption, just by running `dirinfo ~/Library/Developer/Xcode` amd `dirinfo ~/Library/Developer/CoreSimulator`. By deleting some files on these directories, I manage to recover dozens of Gigabytes of storage disk, most of which are occupied by files you no longer need. 

> Hint: If you are an iOS developer, a neat command that can help you recover some disk space is the `xcrun simctl delete unavailable` which will delete all the old simulators.

Feel free to continue the exploration for the files which take most of the storage on your machine. You may be surprised by some of the results.

In my case I was quite surprised to find that it was the folder with my old project that I no longer work on (a.k.a project graveyard - I guess we all have one :smirk:) and Photos, both of which can easily be moved to an external disk or cloud and be recovered when needed.

## Conclusion

And that's about it for this post. Though I was kind of annoyed when I first saw this notification, I would say that eventually it turned out well as I was able to find out more about which files occupy a great part of the storage disk and also have a command that will be there to help me if I face the same issue again in the future.

Thanks for reading, I hope you find this post useful!
If you have any questions, suggestions or comments about this post, just let me know on [Twitter](https://twitter.com/diamantidis_io), I would love to hear from you!!
