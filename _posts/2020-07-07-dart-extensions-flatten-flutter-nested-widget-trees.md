---
layout: post
title: Dart extensions to flatten Flutter's deep nested widget trees
description: How to use Dart extensions instead of nested widgets to flatten the widget tree in a Flutter project
date: 2020-07-07 06:00 +0200
tags: [Flutter, Dart]
image:
    path: /assets/social/dart-extension-flutter-widget.png
    width: 1024
    height: 512
twitter:
    card: summary_large_image
---

In version 2.7, `Dart` introduced extensions to allow developers to add further functionality to an existing component. Extensions can be a great tool in our toolkit when we write business logic, but they can also be as useful in other areas! One such example can be the way we construct the widgets.

Coming from an iOS background and inspired by SwiftUI's ViewModifiers, I was intrigued to use the Dart extensions in a similar fashion to reduce the visual clutter that comes with the deep tree of many nested widgets.

Let's see an example!

## With nested widgets

Here we have the default widget created on [dartpad.dev], where we also wrapped the text inside a `Padding` widget.
```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return
      Padding(
        padding: const EdgeInsets.all(16),
        child: Text('Hello, World!', style: Theme.of(context).textTheme.headline4)
      );
  }
}
```
Now, let's see how we can accomplish the same with the help of Dart extensions.

## With extensions methods

First, we will introduce an extension on `Widget` that will wrap the caller with a padding `Widget`:

```dart
extension WidgetModifier on Widget {
  Widget padding([EdgeInsetsGeometry value = const EdgeInsets.all(16)]) {
    return Padding(
      padding: value,
      child: this,
    );
  }
}
```

With this extension in place, we could turn our `Widget` to the following:

```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Text('Hello, World!', style: Theme.of(context).textTheme.headline4)
            .padding();
  }
}
```

This example is just a small one, but I hope you get the picture!!

We are using the extension method as a syntactic sugar to structure our layout, instead of wrapping a widget inside another one.

Similarly, we can add more functions to our extension and create more complex user interfaces:

```dart
extension WidgetModifier on Widget {

  // ...

  Widget background(Color color) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: color,
      ),
      child: this,
    );
  }

  Widget cornerRadius(BorderRadiusGeometry radius) {
    return ClipRRect(
      borderRadius: radius,
      child: this,
    );
  }

  Widget align([AlignmentGeometry alignment = Alignment.center]) {
    return Align(
      alignment: alignment,
      child: this,
    );
  }
}
```

```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Text('Hello, World!', style: Theme.of(context).textTheme.headline4)
            .padding()
            .background(Colors.lightBlue)
            .cornerRadius(BorderRadius.all(Radius.circular(8.0)))
            .padding(EdgeInsets.symmetric(horizontal: 8, vertical: 16))
            .background(Colors.purple);
  }
}
```

![Dart widget extensions example screenshot]({{site.url}}/assets/dart_extensions/dart_widget_extensions_example.png)

Isn't that great? We now have a clean and elegant widget that we can easily understand! Imagine how many levels of nested widgets you would have to use to recreate this layout without the help of extensions.

## Wrap-up

To wrap up, in this post, we have followed an alternative approach on how to structure a widget tree in a Flutter project, by applying a concept similar to SwiftUI's ViewModifiers.

As a result, this could help us flatten the widget hierarchy and reduce nesting. I have showcased a few examples of such extensions, but you can use the same concept in many other cases as you see fit.

Thanks for reading, I hope you find this post useful!

If you have any questions or comments about this post, feel free to reach out to me on [Twitter]!

Until next time!


[dartpad.dev]: https://dartpad.dev/flutter
[Twitter]: https://twitter.com/diamantidis_io