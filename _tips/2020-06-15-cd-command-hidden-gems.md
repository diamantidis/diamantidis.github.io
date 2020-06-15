---
layout: tips
title: cd command hidden gem
description: How to navigate more efficiently on the command line
date: 2020-06-15 06:00 +0200
tags: ["Command Line"]
image:
    path: /assets/social/tips/cd-command-hidden-gem.png
    width: 825
    height: 512
twitter:
    card: summary_large_image
---


If you are a heavy user of the command line (as I am 🤓), there is a high chance that you use the command `cd` quite often to navigate back and forth to different directories.

Besides the popular `cd <dir>`, `cd` has some more capabilities that are not so widely known and can make the navigation between different directories much more efficient.

Let's say we have the following directory structure and we have to navigate through those folders.
```console
parent
├── child1
│   └── grandchild1
└── child2
    └── grandchild2
```

For example, we have to run the following commands:

```sh
cd child1
cd grandchild1
cd ../../child2
cd grandchild2
```

Did you know that you can use `cd ~2` to navigate back to `~/parent/child1/grandchild1`?

Let me try to explain how this is working.
All the directories that we have visited are stored in a stack. To display this stack, we can use the command `dirs -v`, which will output something like the following: 

```console
0	~/parent/child2/grandchild2
1	~/parent/child2
2	~/parent/child1/grandchild1
3	~/parent/child1
4	~/parent
```

You can now use the number on the left of the directory to navigate through the stack. In our case, we are using `cd ~2` to navigate to the item in position 2.

Isn't that cool? Especially compared to the alternative(`cd ../../child1/grandchild1`)? :sunglasses: