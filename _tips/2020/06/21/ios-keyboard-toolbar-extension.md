---
layout: tips
title: A simple extension to add buttons above the keyboard on iOS apps
description: A simple extension to add actions like "Done" and "Cancel" above the keyboard on an iOS app
date: 2020-06-21 06:00 +0200
tags: [iOS]
image:
    path: assets/social/tips/ios-extension-for-toolbar.png
    width: 767
    height: 512
twitter:
    card: summary_large_image
---

It is quite common when you have an input view on an iOS app to show some actions above the keyboard to improve the user experience. Those actions can range from a `Done` button on a number pad, a `Cancel` button to dismiss the keyboard to literally anything. 

Though there are various options you can use to add those actions, the most common and probably the easiest is to set the property `inputAccessoryView` of the `UITextField` to an instance of `UIToolbar` with items the buttons you would like to add. 

Since it's such a common practice, I am using an extension to make this operation a little bit nicer to use:

```swift
extension UITextField {

    typealias ToolbarItem = (title: String, target: Any, selector: Selector)

    func addToolbar(leading: [ToolbarItem] = [], trailing: [ToolbarItem] = []) {
        let toolbar = UIToolbar()

        let flexibleSpace = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil)
        let leadingItems = leading.map { item in
            return UIBarButtonItem(title: item.title, style: .plain, target: item.target, action: item.selector)
        }

        let trailingItems = trailing.map { item in
            return UIBarButtonItem(title: item.title, style: .plain, target: item.target, action: item.selector)
        }

        var toolbarItems: [UIBarButtonItem] = leadingItems
        toolbarItems.append(flexibleSpace)
        toolbarItems.append(contentsOf: trailingItems)

        toolbar.setItems(toolbarItems, animated: false)
        toolbar.sizeToFit()

         self.inputAccessoryView = toolbar
    }
}
```

Now, with that extension, you can add the toolbar in the following way: 

```swift
let textField = UITextField()
let cancelButton = UITextField.ToolbarItem(title: "Cancel", target: self, selector: #selector(cancelPressed))
let resetButton = UITextField.ToolbarItem(title: "Reset", target: self, selector: #selector(resetPressed))
let doneButton = UITextField.ToolbarItem(title: "Done", target: self, selector: #selector(donePressed))
textField.addToolbar(leading: [cancelButton, resetButton], trailing: [doneButton])
```
