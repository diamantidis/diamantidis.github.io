---
layout: post
title: Xcode shortcuts and custom key bindings
description: A list of useful Xcode shortcuts and the steps to add a custom key binding
date: 2018-12-08 00:00 +0200
comments: true
tags: [Xcode, Shortcuts, Productivity]
---

A recent discussion with a colleague about the use of the Xcode shortcuts is the reason behind this blog post.

The use of keyboard shortcuts can result in greater productivity because it enables a developer to navigate, perform actions and edit code more efficiently compared to using the mouse and the navigation menu.

Apart from this, writing this blog post is also a great opportunity for me to learn more about Xcode shortcuts.

A list of the "default" Xcode shortucts, as listed by Apple, can be found [here](https://developer.apple.com/library/archive/documentation/IDEs/Conceptual/xcode_help-command_shortcuts/Introduction/Introduction.html#//apple_ref/doc/uid/TP40010560-CH1-SW1)

Also this list can be found in Xcode by following Xcode > Preferences (or better `⌘` + `,`) > Key bindings, where you can also edit or add new shortcuts to the commands not yet set. 

![key bindings menu in xcode screenshot]({{site.url}}/assets/shortcuts/key_bindings_menu.png)


## Key mapping 
As some may be unaware and since more often than not Apple's keyboards don't use the symbols, the mapping of the keys to the symbols is the following:

* `⌃` (Control)
* `⌥` (Option)
* `⇧` (Shift)
* `⌘` (Command)

Those symbols will be later used in conjunction with a primary key to form the shortcuts.

## Some examples of useful shortcuts
A list of commands that I primarily use are listed below: 

* Go to line (`⌘` + `L`) <br><span class="list_item_description">As a result, an input text will pop up, and there you can add the number of the line you want to move to.
![go to line screenshot]({{site.url}}/assets/shortcuts/line_number.png)
</span>

* Add breakpoint ( `⌘`+ `\`) <br><span class="list_item_description">A breakpoint will be added to the line.  To activate/deactivate the debugger use `⌘` + `Y`.
</span>

* Fold method (`⇧` + `⌥` + `⌘` + `←`) <br><span class="list_item_description">To unfold method (`⇧` + `⌥` + `⌘` + `→`)</span>

* Build ( `⌘` + `B` ) <br><span class="list_item_description">Also, to clean (`⇧` + `⌘` + `K`)</span>

* Find call hierarchy (`⌃` + `⇧` + `⌘` + `H`) <br><span class="list_item_description">When on a function name, you can press the above-mentioned key combination to find the callers of the function.</span>
	
* Edit all in scope ( `⌃` + `⌘` + `E`) <br><span class="list_item_description">It can be useful in case of renaming a variable or function.</span>

* Jump to Definition (`⌃` + `⌘` + `J`) <br><span class="list_item_description">This can be used if you want to jump to the definition of the method. Also, use  `⌃` + `⌘` + `←` to go back to the invoker again if it's in a different file.</span>

* Move focus to editor (`⌘` + `J`) <br><span class="list_item_description">To move the focus/cursor to the editor area. A new window will open and you can select if you want to move to the editor, to add to a new assistant editor or to move to an existing one.
![move focus to editor screenshot]({{ site.url }}/assets/shortcuts/move_focus_to_editor.png)
</span>
	
* Open is Assistant Editor (`⌥` + `⌘` + `,`) <br><span class="list_item_description">This can be used, if you are in the navigation controller and you want to open a file to the assistant editor.</span>

* Move focus to next Area (`⌥` + `⌘` + `` ` ``) <br><span class="list_item_description">It can be used for scenarios when you are in the main editor and you want to move to the assistant editor. Also, (`⌥` + `⌘` + `⇧`  + `` ` ``) can be used to move back.</span>

* Center selection (`⌃` + `L`) <br><span class="list_item_description">This can be used to move the screen so the selected area is in the center of the screen.</span>

These are only a subset of the available commands that I found really useful. Of course there are plenty more and I am trying to always enrich my list, so feel free to share with me which one you are using.
 

## Custom key bindings 
Apart from the already defined key bindings, there is a way to add custom ones. Features like duplication of a line and moving X numbers of lines up or down are some of the key bindings that Xcode doesn't support.

To add a custom key binding someone has to follow the next steps:
* Open 
``` 
/Applications/Xcode.app/Contents/Frameworks/IDEKit.framework/Resources/IDETextKeyBindingSet.plist
```
* Edit file and add something like the following inside the outer `<dict>`:
```
    <key>Custom Key Bindings</key>
    <dict>
        <key>Move 5 lines down</key>
        <string>moveDown:, moveDown:, moveDown:, moveDown:, moveDown:</string>
        <key>Move 5 lines up</key>
        <string>moveUp:, moveUp:, moveUp:, moveUp:, moveUp:</string>
        <key>Duplicate current line</key>
        <string>selectLine:, copy:, moveToBeginningOfLine:, paste:, moveToEndOfLine:</string>
    </dict>
```
* Restart Xcode
* Go to Xcode > Preferences (or better `⌘` + `,`) > Key bindings
* Find the key bindings
* Assign a keyboard shortcut and
* You can try the new shortcuts :rocket:

![custom bindings menu in xcode screenshot]({{ site.url }}/assets/shortcuts/custom_key_bindings.png)

## Conclusion
Hope you find those shortcuts and start using on your daily routine to save some time. Furthermore, being able to add custom bindings can prove to be really useful especially on cases that are not supported by Xcode and are quite common, like quickly moving up and down on a file. 
