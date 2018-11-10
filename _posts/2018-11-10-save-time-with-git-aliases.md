---
layout: post
title: Save time with git aliases
description: How to use git aliases to save aliases, oh my zsh, 
date: 2018-11-10 08:02 +0200
comments: true
tags: [Git, Productivity]
---


This is a blog post for those that don't like using the computer mouse or trackpad, those who don't use [Sourcetree](https://www.sourcetreeapp.com/) or other version-control tools to manage a repository.
The fans of the command line. Are you tired of writing these long commands like `git push --set-upstream` when you have to push a new branch to remote? One of the solutions that will save those precious seconds while typing these git commands is git aliases. :rocket:


## Add git alias
The simplest way to add a git alias is by running a command to add the alias to the git global configuration file.
For example, running the command `git config --global alias.hist "log --pretty=format:'%h %ad | %s%d [%an]' --graph --date=short"` will add the alias `git hist`.

Alternatively, you can edit the git config file, usually located at `~/.gitconfig`.

> `Hint:` The location of the file can be found by running: `git config --list --show-origin` or by running `git config --global -e`. The first command will list all the git-related configuration, along with the file they are placed, and the second command will open the global config file for edit with the default editor.

![Git Config list screenshot](/assets/git_aliases/git_config_list.png)
<sub><sup>Screenshot for `git config --list --show-origin`</sup></sub>
![Git Config global -e screenshot](/assets/git_aliases/git_config_global_e.png)
<sub><sup>Screenshot for `git config --global -e`</sup></sub>

To add an alias to the global git config file, you can simply add a section for alias (if it doesn't exist) and start writing your aliases like:
```
[alias]
  co = checkout
  c = commit
  s = status
```

![Git Config aliases screenshot](/assets/git_aliases/git_config_aliases.png)

## Shell level aliases
If your shell supports aliases or shortcuts, you can add aliases on this level, too. For example, edit the `.bash_profile` by running the command
`vim  ~/.bash_profile` (or create if it doesn't exist by running `touch ~/.bash_profile`) and add some aliases like:
```
alias g='git'
alias ga='git add'
```

![Bash profile screenshot](/assets/git_aliases/bash_profile.png)

After saving and exiting, run `source ~/.bash_profile` or `. ~/.bash_profile` to source the modified file.

## Is there anything more?
The answer is yes. [Oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh). Above all the others (one of their selling point that I like is `Oh My Zsh will not make you a 10x developer...but you might feel like one.`), it comes by default with a git plugin with all these aliases installed. All the list of the available aliases can be found in their [documentation](https://github.com/robbyrussell/oh-my-zsh/wiki/Plugin:git).

The only thing you have to do is to enable it in the `.zshrc` file by editing this file and more precisely the `plugins` sector to add the git plugin, like in the screenshot below.

![Oh-my-zsh plugins screenshot](/assets/git_aliases/oh_my_zsh_plugins.png)

Then, you have to source the file by running either `source ~/.zshrc` or `. ~/.zshrc`

The next step is to learn the commands and start using them. :smile:

> Oh My Zsh, apart from the `git` plugin, contains by default a  huge list of useful plugins. The list can be found [here](https://github.com/robbyrussell/oh-my-zsh/wiki/Plugins)

## Conclusion

Writing git commands on a Terminal is an integral part of my daily routine, so improving this part leads to a better daily programming experience. Saving a few keystrokes here and there, doesn't seem so, but in the long run, it saves a lot of time. Furthermore, as the commands are shorter, it lowers the risk of typos like `git chekcout` :smile:. Last but not least, it is kind of cool and hackish to run these shortcuts, especially when running them in front of others who do have to type the full git commands to stage, commit and push files. :computer:

I hope that you find it interesting and you will start using the git aliases on your daily routine from now on!
