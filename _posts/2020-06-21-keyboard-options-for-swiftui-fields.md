---
layout: post
title: Keyboards options for SwiftUI fields
description: "A post exploring the keyboard options on SwiftUI. From the keyboardType function to using custom views like a date picker"
date: 2020-06-21 06:00 +0200
tags: [Swift, SwiftUI, iOS]
image:
    path: /assets/social/keyboard-options-for-swiftui-fields.png
    width: 910
    height: 512
twitter:
    card: summary_large_image
---

One of the ways to improve the user experience when they fill a form on iOS apps is the use of keyboard types. Keyboard types can be used to show different keyboards based on the context of the field. If it's an email field, for example, you would probably prefer to present a keyboard with easy access to characters like the at (`@`) and the dot (`.`))

In this post, we are going to see how different keyboard options work with SwiftUI. First, we will cover the "common" scenarios, which include keyboards for fields like name, email, number, etc. Then, we will take a look at how we can add more custom options like a date picker or a picker view.

## The common cases

For the most common cases, SwiftUI provides the function `keyboardType` in a `View` extension. This function has a parameter of type `UIKeyboardType`, which is an enum with cases like `emailAddress`, `numberPad`, `URL`, etc.

> For the full set of cases, you can refer to the [documentation page](https://developer.apple.com/documentation/uikit/uikeyboardtype).

You can use this extension from any SwiftUI View in the following way:

```swift
TextField("Type the email...", text: $email)
    .keyboardType(.emailAddress)
```

![Email keyboard screenshot]({{site.url}}/assets/swiftui_textfield_keyboards/email-keyboard.png)

But what if we want to add a custom view? For example, a date picker or a picker view, just like we are able to do using UIKit?


## Keyboard with date picker

As you may have guessed, the answer lies exactly there.

We will have to use UIKit's UITextField and make it available on SwiftUI by creating a struct with conformance to the `UIViewRepresentable` protocol.

But let's take it step by step and start with the `DateField`; a field that will show a keyboard with a date picker, just like in the following screenshot.

![Date picker keyboard screenshot]({{site.url}}/assets/swiftui_textfield_keyboards/date-picker-keyboard.png)

To keep things separated, let's create a subclass of `UITextField` where we will implement that logic:

```swift
class DateTextField: UITextField {
    // MARK: - Public properties
    @Binding var date: Date?

    // MARK: - Initializers
    init(date: Binding<Date?>) {
        self._date = date
        super.init(frame: .zero)

        if let date = date.wrappedValue {
            self.datePickerView.date = date
        }

        self.datePickerView.addTarget(self, action: #selector(dateChanged(_:)), for: .valueChanged)
        self.inputView = datePickerView
        self.tintColor = .clear
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    // MARK: - Private properties
    private lazy var datePickerView: UIDatePicker = {
        let datePickerView = UIDatePicker()
        datePickerView.datePickerMode = .date
        return datePickerView
    }()

    // MARK: - Private methods
    @objc func dateChanged(_ sender: UIDatePicker) {
        self.date = sender.date
    }
}
```

In this snippet, first, we declare a `Binding` property that acts both as an input in case the field is pre-filled and as an output for the case when the user changes the date on the date picker. Then, in the initializer, we are expecting an argument to instantiate the binding property and set the value of the `UIDatePicker` if the field is pre-filled. We also add a target-action for when the value of the date picker changes. Finally, we set the property `inputView` to the instance of the `UIDatePicker`, to add the date picker to the keyboard.

With that in place, we will create a new struct that we will use to communicate between the UIKit view and the SwiftUI world.

```swift
struct DateField: UIViewRepresentable {
    // MARK: - Public properties
    @Binding var date: Date?

    // MARK: - Initializers
    init<S>(_ title: S, date: Binding<Date?>, formatter: DateFormatter = .yearMonthDay) where S: StringProtocol {
        self.placeholder = String(title)
        self._date = date

        self.textField = DateTextField(date: date)
        self.formatter = formatter
    }

    // MARK: - Public methods
    func makeUIView(context: UIViewRepresentableContext<DateField>) -> UITextField {
        textField.placeholder = placeholder
        return textField
    }

    func updateUIView(_ uiView: UITextField, context: UIViewRepresentableContext<DateField>) {
        if let date = date {
            uiView.text = formatter.string(from: date)
        }
    }

    // MARK: - Private properties
    private var placeholder: String
    private let formatter: DateFormatter
    private let textField: DateTextField
}
```

Same as the `DateTextField` class, this struct will have a binding property for the value of the field, and we will instantiate it via an argument we pass through the initializer. The initializer takes two more arguments: one for the placeholder and one for the formatter which we will use to transform the `Date` to a `String`.


For the formatter field, we are using a default value set to `.yearMonthDay`, which is defined as a static var on a `DateFormatter` extension:

```swift
extension DateFormatter {
    static var yearMonthDay: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }
}
```

Then, we provide the implementations for the `makeUIView` and `updateUIView` requirements of the `UIViewRepresentable` protocol. In the first one, we set the initial state for the text field by setting the value for the placeholder. In the second, we update the value of the `DateTextField` with any new information we may get from SwiftUI.

Finally, from any SwiftUI view, we can use this struct in the following way:

```swift
@State private var date: Date?

var body: some View {
    // ...
    DateField("Enter the date", date: self.$date)
    // ...
}
```

> :bulb: You can also add a toolbar above the keyboard with buttons like "Done" and "Cancel" to improve the user experience. If you want to do so, feel free to [check the extension that I am using]({{ "/tips/2020/06/21/ios-keyboard-toolbar-extension" | absolute_url }}).

## Picker Views

Similarly we can create a `UITextField` with a `UIPickerView` as an `inputView`.

![Picker view keyboard screenshot]({{site.url}}/assets/swiftui_textfield_keyboards/picker-view-keyboard.png)

We will also create a subclass of `UITextField`. This time the initializer should take as arguments both the options of the picker and a binding property for the selected one. We should also provide the implementation for the `UIPickerViewDataSource` and the `UIPickerViewDelegate`.

You can find the code for this [`PickerTextField`](https://gist.github.com/diamantidis/061d101853f6400f76780345614b2c90#file-pickertextfield-swift), as well as [the rest of the code](https://gist.github.com/diamantidis/061d101853f6400f76780345614b2c90#file-pickerfield-swift) and [an example of how to use it from a SwiftUI View](https://gist.github.com/diamantidis/061d101853f6400f76780345614b2c90#file-contentview-swift) on this [Gist](https://gist.github.com/diamantidis/061d101853f6400f76780345614b2c90).


## Conclusion
And that's about it! In this post, we have first seen what is the current level of support for keyboard types on SwiftUI's `TextField`. Then, we investigated how we can provide support for more options by relying on the UIKit's UITextField, and its property `inputView`. This way, we can present a keyboard with a `UIDatePicker`, a `UIPickerView`, or any other view we may want.

Now it's time to prepare for the Dub-Dub. Let's hope that there will be some announcement or a new API for the custom keyboard types on SwiftUI, and we won't have to rely solely on UIKit. :crossed_fingers:

Thanks for reading, I hope you find this post useful.

If you like this post and you want to get notified when a new post is published, you can follow me on [Twitter] or subscribe to the [RSS feed].

Also, if you have any questions or comments about this post, feel free to contact me on [Twitter]!

Until next time!

[RSS feed]: {{ "feed.xml" | absolute_url }}
[Twitter]: https://twitter.com/diamantidis_io
