---
layout: post
title: Modifying UI elements with Xcode and LLDB v2 
description: Modifying UI elements with Xcode and LLDB v2 (Aliases, Python and Chisel)
date: 2018-10-14 08:02 +0200
comments: true
tags: [iOS, Xcode, LLDB, Python]
---

In a [previous post](/2018/09/30/modifying-ui-elements-with-lldb), I wrote an introduction about the use of LLDB expressions to modify the UI elements. In this post, I will continue on the same topics and I will focus on how to get the most out of the LLDB expressions. 
No tool will ever work and get user adoption if it is too complicated. 
For this reason, I will write about a number of alternatives to make LLDB expressions easier to use.

## Command aliases 
First and foremost, having to type (or copy) a command of this length (e.g `po [[[UIApplication sharedApplication] keyWindow] recursiveDescription]`) may discourage developers from using these LLDB commands. Fortunately, there is a solution to this problem.

It is called `Command Aliases`.
The only thing needed is to edit a file located in the directory `~/.lldbinit`(or create it if not there, by typing `touch ~/.lldbinit`) and add the commands like:

```sh
command alias views expression -l objc -O -- [[[UIApplication sharedApplication] keyWindow] recursiveDescription]

command alias flush expression -l objc -- (void)[CATransaction flush]
command regex change_color 's/(.+) (.+)/e (void)[(id)%1 setBackgroundColor:[UIColor %2]]/'
 ```

The first two commands are already described in the previous post. The first one is to print the view hierarchy and from there get the memory address of the button, and the second one is to refresh the UI. 

The last one is an example of how to use `regex` to create a command with parameters. In this particular case, a memory address and the name of the color (blueColor) is expected. As an outcome, the background color of the button will change.
For example, running `change_color 0x7f9f7e40cd70  blueColor` and `flush` will result in changing the background color of the button to blue.

Making use of the aliases will improve the possibility of using this tool, but there are cases where more advanced aliases are needed.
Let's say, how to find the button's memory address by the text of the button label.

In such cases, Python comes to the rescue to provide extendability.

## LLDB and Python

An easy way to start writing a python command is to use the Xcode console and just type `command script add help` and follow the instructions.

![command script add help screenshot]({{site.url}}/assets/lldb2/script_add_help_commmand.png)

Alternatively, you can create a script file, that can be added to the repo and a version control system, and then run the command `command script import <script_file_path>` on the Xcode console or better add it to the `~/.lldbinit` file. 

To write a python function that will be used as a new LLDB command, a function that takes four arguments should be implemented:
```python
def command_function(debugger, command, result, internal_dict):
    # Your code goes here
```

The type and the description of each of these variables, according to the [LLDB python reference](https://lldb.llvm.org/python-reference.html), is the following:

- `debugger` (type: `lldb.SBDebugger`): The current debugger object.
- `command` (type: `python string`): A python string containing all arguments for your command. If you need to chop up the arguments try using the shlex module's shlex.split(command) to properly extract the arguments.
- `result` (type: `lldb.SBCommandReturnObject`): A return object which encapsulates success/failure information for the command and output text that needs to be printed as a result of the command. The plain Python "print" command also works but text won't go in the result by default (it is useful as a temporary logging facility).
- `internal_dict` (type: `python dict object`): The dictionary for the current embedded script session which contains all variables and functions.



If you are using the `command script import` approach, you can define the function `__lldb_init_module` like below:
```python
def __lldb_init_module(debugger, internal_dict):
    # Command Initialization code goes here
    debugger.HandleCommand('command script add -f filter.filter_button_by_label filter_button_by_label')
```
where debugger and internal_dict are as above.

This function will get called when the module is loaded allowing you to add whatever commands you want into the current debugger.

The description of the argument of the `debugger.HandleCommand` is the following:

- `command script add`: LLDB command to add a script.
- `-f argument`: Specifies the name of the Python function that the command will execute. It follows the format `{module name}.{function name}`.<br>
In the example above:
	- `filter`: is the name of the module (in Python is just the file name without the .py extension)
	- `filter_button_by_label`: is the command function. (the one described previously as `command_function(debugger, command, result, internal_dict)`)
- `last argument` (for example, `filter_button_by_label`): is the command that will be used in the Xcode console to invoke this function.

The full example can be found in the following gist: 

{% gist d95531fd571c360078fcc795d1967ded filter.py %}

This is an example of how to get the memory address of a button from the text of the button label. It can be called like `filter_button_by_label -n "Press me"` and it will return the memory address of that button.

So the whole flow of changing the color of a button has changed to:

![final flow to change button screenshot]({{site.url}}/assets/lldb2/final_commands.png)

which is much shorter and easier to remember and therefore use compared to the first implementation.

## [Chisel](https://github.com/facebook/chisel)
Above all these, there is already an open sourced collection of LLDB commands provided by Facebook, named [Chisel](https://github.com/facebook/chisel).
It provides a plethora of commands that probably solves most of the problems any iOS developer may face.

> Hint: If you find Chisel interesting and you would like to contribute or somehow redistribute it, spend some time reading the [contributing documentation](https://github.com/facebook/chisel/blob/master/CONTRIBUTING.md) and the [license](https://github.com/facebook/chisel/blob/master/LICENSE).

Two of my favourite commands are the following:

* `findinstances` which can be used to find instances of specified ObjC classes, and 
* `pcurl` which can be used to print the NSURLRequest as curl command, that can later be used for debugging purposes.

## Conclusion

That's it for now!! I chose to write those two posts regarding LLDB expressions, because I am an advocate of always trying to improve the workflow and remove some of the burdens that come "by default" with each tool.

Furthermore, I decided to follow this flow and not just mention the final solution or just a tool, because digging deeper and understanding how the tools work and how they are built has each own benefits. Reinventing the wheel is not always the right approach to solve some problems, but most of the time is at least educational and enjoyable. Last but not least, by acquiring this knowledge, someone not only makes his life easier when working on UI changes, but also can improve his skills in other areas (e.g. LLDB, Python) and ultimately get a greater confidence on his skills and the ability to overcome any problems that may arise.

> There is nothing impossible to him who will try.
> - Alexander the Great