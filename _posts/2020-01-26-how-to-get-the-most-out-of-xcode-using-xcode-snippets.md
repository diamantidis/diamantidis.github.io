---
layout: post
title: "How to get the most out of Xcode: Xcode Snippets"
description: A post about how to create, use and share Xcode Snippets to improve your productivity when working on Xcode
date: 2020-01-26 06:00 +0200
comments: true
tags: [iOS, Xcode, Productivity]
---

One of the hidden gems of Xcode is a feature called `Xcode Snippets`. Despite the fact that most developers happen to use them quite often, only handful of them are aware of what they actually are and even fewer how to take full advantage of them.
Simply put, they are just code snippets that you can add and reuse easily thanks to code completion. 

The most common use-case is to save code chunks that you use quite frequently, are too long to type every time or are too hard to remember. Utilizing the power of Xcode Snippets will enable you to speed up your development process and eliminate the habit of copying/pasting pieces of code here and there.

So, in this post I will try to walk you through everything you need to know about Xcode Snippets, starting from where you can find them, how to use them, how to create new custom snippets based on your needs, and finally how to share them with others.

Let's start!!

## Where to find current snippets

Xcode comes with a set of predefined snippets and to find them you can use one of the 3 following options. You can either:
1. use the top bar menu to navigate to `View` > `Show Library` (requires a file with code to be opened, not a Storyboard or a plist)
2. use the keyboard shortcut shift-command-L (`⇧`+`⌘`+`L`).
3. press the `+` button on the right side of the toolbar

![Xcode toolbar screenshot]({{site.url}}/assets/xcode_snippets/xcode_toolbar.png)

## How to use current snippets

If you want to use the existing snippets or any other that you may create, you have two options. You can either:
1. take advantage of code completion and start typing the shortcut of the snippet. For example, if you try to type `func`, you will see a suggestion with the icon `{}` on the left side, like the screenshot below:

![Xcode func code completion screenshot]({{site.url}}/assets/xcode_snippets/xcode_type_completion.png)

2. or open the library with one of the three ways mentioned before, filter the snippet that you are interested in using and simply drag and drop it to your file.

![Xcode library filter  screenshot]({{site.url}}/assets/xcode_snippets/xcode_library_filter.png)


## How to add a new snippet

Let's now see how we can add a new custom snippet.

One use-case that Xcode Snippets can be particularly useful is when developing the UI of the app using programmatic views with Auto Layout. Some parts of the code are quite verbose and taking advantage of Xcode snippets could prove to be a true time saver.


Imagine that we want to add a UIStackView in our UIViewController. To do so, we would write something like the following:
```swift
private lazy var customStack: UIStackView = {
    let stackView = UIStackView()
    stackView.translatesAutoresizingMaskIntoConstraints = false

    return stackView
}()
```

To create a new snippet, you will have to select this exact chunk of code, press right click and select the option `Create Code Snippet`.

![Xcode menu options screenshot]({{site.url}}/assets/xcode_snippets/xcode_menu_options.png)


In the popup that will appear, enter a name and if you want, a summary. Last thing before pressing the `Done` on the bottom right corner is to add some value on the `completion` field. This value can later be used when you want to add the snippet in your code and code completion will do the rest for you. So, better put something short and relevant, like `st`.

![Xcode create snippet screenshot]({{site.url}}/assets/xcode_snippets/create_snippet.png)


As you may have noticed from the screenshot above, there are some other options that we can tweak. These options include the language, the platform and lastly the availability which defines the scope in which the snippet will be available, and can have values such as `All`, `Class implementation`, `Code Expression`, `Function or method`, `String or comment` and `Top level`. 


Now, we can go back to our code, delete the entire `customStack` variable that we created before and instead type `st` or the value that you decide to put on the `completion` field in the previous step.

First among the option that code completion suggests is the snippet that we have just created. Select this option, press `Enter` and voilà, the whole UIStackView snippet is added.

![Code snippet code completion screenshot]({{site.url}}/assets/xcode_snippets/code_snippet_type_completion.png)


But, that's not all you can do. Usually, you would prefer a different and more descriptive name each time you want to add a new variable. This can be done with the help of placeholders. 
Let's see first how to add them and then what they actually are. 

Open the snippet Library with one of the three ways mentioned above, find the `stackView` snippet and press the button `Edit` on the bottom right corner. 

If you try to replace the variable name from `customStack` to `<# name #>`, you will notice this part changing to a label with blue background. What does it mean? 

Press the `Done` button, go back to the editor and type the completion `st` again. The code snippet is added as before but this time instead of the name `customStack`, you have a placeholder with focus, so you can just type something and that will be the name of the `UIStackView` variable. Similarly, we can add more placeholders and use the Tab button to change the focus and move to the next placeholder. 

For example, for the `UIStackView` we may want to set some more properties like the `alignment`, the `spacing` and the `distribution`, like in the following snippet:

```swift
private lazy var <# name #>: UIStackView = {
    let stackView = UIStackView()
    stackView.alignment = <# alignment #> 
    stackView.spacing = <# spacing #>
    stackView.distribution = <# distribution #>
    stackView.translatesAutoresizingMaskIntoConstraints = false
    return stackView
}()
```

As a result, when you type the completion `st` in your editor, you will get something like the following gif: 

![Code snippet example screenshot]({{site.url}}/assets/xcode_snippets/xcode_snippet_example.gif)

## Time to share
So far we have seen how to create and use the snippets, so now it is time to start sharing them with others that might find them useful, either in your team or the whole community. Let's see how!

For each custom snippet that we have created, there is a file stored in the directory ```~/Library/Developer/Xcode
/UserData/CodeSnippets/```. Those files are plain plist documents using a random UUID as a name and having the `.codesnippet` file extension. 

You can simply copy those files, rename them to a more descriptive name and then add them to a repo to share them with others. With a little search, you can find examples of such repos on GitHub, like this [one](https://github.com/burczyk/XcodeSwiftSnippets) which you can use right now.

## Conclusion

And that's about it! In this post, we have seen how to create, use and share Xcode snippets.

In conjunction with [Xcode Templates]({%post_url 2019-07-21-xcode-custom-templates %}) and [shortcuts]({%post_url 2018-12-09-xcode-shortcuts-and-custom-key-bindings %}), Xcode snippets can enhance productivity and efficiency while writing code in Xcode. Especially when it comes to trivial repetitive tasks, you would prefer to perform them as fast as possible, so that you can focus on the more interesting and important tasks. 

Moreover, Xcode snippets can prove to be really helpful in live code presentations where they can both relieve you of the stress of mistyping something and also speed up the presentation by avoiding the unwanted pauses while typing.

Thanks for reading, I hope you find this post useful!
Feel free to follow me on [Twitter](https://twitter.com/diamantidis_io) and share your comments about this post!!