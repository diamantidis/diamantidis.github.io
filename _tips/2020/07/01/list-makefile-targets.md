---
layout: tips
title: How to list all the targets on a Makefile
description: A tip on how to add a target on your Makefile to list all available targets
date: 2020-07-01 06:00 +0200
tags: ["Command Line"]
image:
    path: /assets/social/tips/list-makefile-targets.png
    width: 966
    height: 512
twitter:
    card: summary_large_image
---

`make` is great tool to orchestrate the setup and build process of a project. It expects a `Makefile`, where we define targets to execute, like for example `install` and `run`. Then we can use `make install` and `make run` to execute those tasks. 

While target names like `install` are quite common, the problems arise when we have to deal with a lengthy `Makefile`, and we are not aware of all the available targets.

Hopefully, with a slight modification of our current `Makefile` and the addition of a new target, we can expose this information and access it from the Terminal app. Let's see how!

First, we will have to document each of the existing targets. To do so, we will add a comment starting with `##` right after the target's name.

```bash
install: ## Install 
	@echo "Installing..."

run: ## Run
	@echo "Running..."
```

Then, we will use the `grep` and `sed` command to get the name of the target and the documentation, like in the following snippet:

```bash
.DEFAULT_GOAL := help
.PHONY: help

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	| sed -n 's/^\(.*\): \(.*\)##\(.*\)/\1{{MAKEFILE_TARGET_SEPARATOR}}\3/p' \
	| column -t  -s '{{MAKEFILE_TARGET_SEPARATOR}}'
```

We will also set the `.PHONY` and the `.DEFAULT_GOAL` variables. The last one will make `help` the default target when running `make` without a specific target.


Now, if we head back to the Terminal app, and run `make`, we will get the list of the documented targets as an output :rocket:

```log
install  Install
run      Run
```
