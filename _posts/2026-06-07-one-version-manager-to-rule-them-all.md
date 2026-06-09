---
layout: post
title: "One Version Manager to Rule Them All"
description: "How I replaced rbenv and nvm with mise - a single polyglot version manager for Ruby, Node.js, and more."
date: 2026-06-07 12:00 +0200
tags: [mise, DevTools, Productivity]
image:
    path: /assets/social/one-version-manager-to-rule-them-all.png
    width: 868
    height: 512
twitter:
    card: summary_large_image
---

Managing versions is one of those things you don't think about much. For a long time, I used **rbenv** and **nvm** to handle the versions of Ruby and Node.js on this project. Each worked fine on its own, but the friction was always there. Two separate tools, two config files, and two things to remember when getting back to the project. Something was feeling off.

And then I found [mise][mise], and I had one of those aha moments where everything falls into place.

## The problem with multiple version managers

If you work across different languages, you probably have a setup that looks something like this:

- `~/.rbenv` + `rbenv` shell integration + `.ruby-version` per project
- `~/.nvm` + `nvm` shell integration + `.nvmrc` per project
- Maybe `pyenv` for Python, or `goenv` for Go...

Each version manager has its own installation method, its own version file format, and its own quirks. When you clone a new repo, you need to check which version files are present and install the right runtimes manually. It works, but it's friction. And that's one of the problems that [mise][mise] tries to solve.

## What is mise

[mise][mise] (pronounced "meez") is a polyglot version manager. It replaces rbenv, nvm, pyenv, goenv, and similar tools with a single binary. It reads a `.mise.toml` file in your project root and automatically activates the correct versions when you `cd` into the directory.

Key features:

- **One config file**: `.mise.toml` lists all your project's runtimes and versions
- **Automatic switching**: mise activates the right versions as you navigate between projects
- **Wide language support**: Ruby, Node.js, Python, Go, Rust, and [many more][mise-languages]
- **No shell plugins needed**: uses a shell hook (`eval "$(mise activate bash/zsh)"`) instead of per-tool plugins

## Before and after

Here's what my setup looked like before:

```
# Before: .ruby-version
ruby 3.3.4

# Before: .nvmrc
22.2.0
```

Two files, two tools, two shell integrations.

After switching to mise, everything lives in one file:

```toml
# After: .mise.toml
[tools]
ruby = "3.3.4"
node = "22.2.0"
```

This is the actual [`.mise.toml`][.mise-toml] file from this blog's repository.

## Migration

Migrating was straightforward. Here's what I did:

### 1. Install mise

```bash
curl https://mise.run | sh
```

Then add the shell hook to your `.zshrc` (or `.bashrc`) :

```bash
eval "$(~/.local/bin/mise activate zsh)"
```

### 2. Configure your tools

Create a `.mise.toml` file in your project root with the runtimes you need:

```toml
# .mise.toml
[tools]
ruby = "3.3.4"
node = "22.2.0"
```

Then run `mise install` to download and install the versions specified in the file. mise reads the config automatically when you `cd` into the project directory.

### 3. Remove the old managers

Once everything works with mise, the old `.ruby-version` and `.nvmrc` files from your projects. And maybe cleanup rbenv and nvm if they are not used on another project:

```bash
# Remove rbenv
rm -rf ~/.rbenv
# Remove rbenv from .zshrc / .bashrc

# Remove nvm
rm -rf ~/.nvm
# Remove nvm from .zshrc / .bashrc
```

And that was it! 

## Conclusion

Switching from rbenv and nvm to mise took only a few minutes. Now, whether I'm setting up an existing project or starting a new one, the process is the same: a single `.mise.toml` file that makes it clear which runtimes and versions a project needs. If you also feel that your project can benefit from this, give [mise][mise] a try.

Thanks for reading! If you found this post useful, consider [buying me a coffee] to support the blog. For questions or comments, feel free to reach out on [X]!

Until next time!

[mise]: https://mise.jdx.dev
[mise-languages]: https://mise.jdx.dev/langs.html
[.mise-toml]: https://github.com/diamantidis/diamantidis.github.io/blob/source/.mise.toml
[buying me a coffee]: https://www.buymeacoffee.com/diamantidis
[X]: https://x.com/diamantidis_io
