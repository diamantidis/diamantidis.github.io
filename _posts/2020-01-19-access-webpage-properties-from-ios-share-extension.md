---
layout: post
title: Accessing web page properties from an iOS Share Extension
description: A step-by-step guide on how to use Swift and JavaScript to access web page properties like the title and the favicon from an iOS Share Extension
date: 2020-01-19 06:00 +0200
comments: true
tags: [iOS, "Swift", "App Extensions"]
---

A Share Extension is a type of App Extension which is used to share content with other apps. One such content type and a quite popular use case for share extensions is sharing websites and definitely one of the factors that led to this is the seamless integration with Safari.

Recently I have been working on a web page Share Extension and one of the tasks that I wanted to achieve is to show the favicon of the web page as part of the UI of the share extension. After some research, I find out that a share extension offers some other capabilities and enables us to do more interesting things beyond just sharing the URL of the web page.

One example is that it allows us to parse the web page that's being shared and access its elements, like for example the title of the page or the favicon from the link tag on the `<head>` of the website.

And that's what this post is all about! We are going to investigate how to access some of the web page properties like the title, the host name and the favicon URL for the website that is being shared. 

So, let's go!

> For this post, I assume that you know how to create an iOS Share Extension. If you want to learn more, check out [a previous post describing how to create a Share Extension and customize its UI]({%post_url 2020-01-11-share-extension-custom-ui %}).


# Implementation

To begin with, let's try to get the title of the web page. To accomplish that, we are going to use some JavaScript code which Safari will execute and return the results to our extension. Let's see how!

First, let's move to our Share Extension and create a JavaScript file named `ExtensionClass.js` and add the following content:
```javascript
var ExtensionClass = function() {};

ExtensionClass.prototype = {
    run: function(arguments) {
        arguments.completionFunction({
            "title": document.title
        });
    }
};

var ExtensionPreprocessingJS = new ExtensionClass;
```

Basically what we are doing here is to create a custom JavaScript class that contains a `run` function and then assign a new instance of it to a global object named `ExtensionPreprocessingJS`. The name `ExtensionPreprocessingJS` is required in this file whereas the name of the custom class can vary.

Safari will invoke this `run` function when it loads the JavaScript file and it will provide an argument with the name `completionFunction` which in turn takes a key-value object as a parameter. This key-value object is the information that will be passed to our `Share Extension`.


After that, we will have to add an entry in the `Info.plist` file. Open this file and add the following key-value pair inside the dictionary value of the key `NSExtensionAttributes`:

```xml
<key>NSExtensionJavaScriptPreprocessingFile</key>
<string>ExtensionClass</string>
```

We will also replace the value for the `NSExtensionActivationRule` from 

```xml            
<string>TRUEPREDICATE</string>
```

to 
```xml
<dict>
    <key>NSExtensionActivationSupportsWebPageWithMaxCount</key>
    <integer>1</integer>
    <key>NSExtensionActivationSupportsWebURLWithMaxCount</key>
    <integer>1</integer>
</dict>
```

Then, head to the Swift file and add the following function inside your View Controller:

```swift
private func accessWebpageProperties(extensionItem: NSExtensionItem) {
    let propertyList = String(kUTTypePropertyList)

    for attachment in extensionItem.attachments! where attachment.hasItemConformingToTypeIdentifier(propertyList) {
        attachment.loadItem(
            forTypeIdentifier: propertyList,
            options: nil,
            completionHandler: { (item, error) -> Void in

                guard let dictionary = item as? NSDictionary,
                    let results = dictionary[NSExtensionJavaScriptPreprocessingResultsKey] as? NSDictionary,
                    let title = results["title"] as? String else {
                    return
                }

                print("title: \(title)")
            }
        )
    }
}
```

Here, we iterate over the attachments if there are any and then filter those who conform to the `kUTTypePropertyList` type identifier.
After that, we load the item's data, parse it and using the key ```NSExtensionJavaScript
PreprocessingResultsKey``` we retrieve the object passed on the `completionFunction` in the JavaScript code

Lastly, all you have to do is to call this function from the `viewDidLoad` function, in the following way:
```swift
if let item = extensionContext?.inputItems.first as? NSExtensionItem {
    accessWebpageProperties(extensionItem: item)
}
```

If you now run the extension Target on Safari, and try to share a web page using this Share Extension, you will see the title on the title of the page on the Console View.

In a similar fashion, we can access other information like the host name or the URL of the favicon. 

Getting the host name in JavaScript is as easy as executing `document.location.hostname`, so it's more or less the same as the title. On the other hand, retrieving the URL of the favicon is quite more complicated. The preferred way to declare a favicon and the one that most websites follow is by adding a link element with a `rel="icon"` or `rel="shortcut icon"` attribute on the HTML head. 

For this reason, we are going to add a function in our JavaScript file named `fetchFavicon` and its responsibility will be to traverse the web page and find if there is one such element.


The final version of the `ExtensionClass.js` will be like the following snippet:

```javascript
var ExtensionClass = function() {};

ExtensionClass.prototype = {
    run: function(arguments) {
        arguments.completionFunction({
            "title": document.title,
            "hostname": document.location.hostname,
            "favicon": this.fetchFavicon()
        });
    },
    fetchFavicon: function() {
        return Array.from(document.getElementsByTagName("link"))
                .filter(element => element.rel == "icon" || element.rel == "shortcut icon")
                .map(elem => elem.href)[0];
    }
};

var ExtensionPreprocessingJS = new ExtensionClass;
````

Then we can move back to our View Controller and edit the body of the `completionHandler` in `accessWebpageProperties` to look like the following snippet:

```swift
guard let dictionary = item as? NSDictionary,
    let results = dictionary[NSExtensionJavaScriptPreprocessingResultsKey] as? NSDictionary,
    let title = results["title"] as? String,
    let hostname = results["hostname"] as? String else {
        return
}

// Fallback to the favicon.ico file, if JavaScript returns nil
let favicon = results["favicon"] as? String ?? "\(hostname)/favicon.ico"
print("title: \(title), hostname: \(hostname), favicon: \(favicon)")    
```

And that's about it! If you try to run and use the Share Extension again, you will see the message with the corresponding values on the Console View. :tada:


# Conclusion

In this post, we have seen how to parse the webpage from our webpage Share Extension and access some information like the title, the host name and the favicon's URL. 

Depending on your case, you can follow a similar approach to access the webpage elements that you are interested in and later use them in your View Controller to populate some UI elements of the Share Extension or share it with the associated main app. 

Thanks for reading, I hope you find this post useful!
Feel free to follow me on [Twitter](https://twitter.com/diamantidis_io) and share your questions, suggestion or comments about this post!!
