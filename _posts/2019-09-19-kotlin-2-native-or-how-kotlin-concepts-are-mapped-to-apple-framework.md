---
layout: post
title: "From Kotlin to Native: Or how Kotlin concepts are mapped to the Apple framework"
description: 
date: 2019-09-19 06:00 +0200
comments: true
tags: [Swift, Kotlin, KMP, ObjC]
---

TL;DR This post is about how some specific Kotlin features are compiled to Objective-C and how they can be used in a Swift project when using Kotlin Native to build an Apple framework.

Recently, I have started exploring and experimenting with Kotlin Native and, till now, my main focus was on activities related with the preparation of a project. As part of this, I managed to write a few posts about activities like [the project setup]({% post_url 2019-08-04-setup-kotlin-multiplatform-project %}), [unit tests]({%post_url 2019-08-25-kotlin-multiplatform-project-unit-tests-for-ios-and-android %}), [code quality tools]({%post_url 2019-09-01-kotlin-multiplatform-project-code-styling-for-ios-and-android %}) and [continuous integration]({%post_url 2019-09-08-continuous-integration-for-kotlin-native-projects-with-gitlab-ci %}). 

Now, it's time to dig deeper and investigate on how things are working under the hood. So, in this post I will focus on exploring how specific Kotlin concepts like functions, enumerations, sealed classes, generics and others are mapped to Objective-C when building the Apple framework and how they can be used in a Swift project that uses this framework.

# Project

Before we start, it is worth pointing out that all the code used in this post can be found on a [repo hosted on GitHub](https://github.com/diamantidis/KNPlayground). It's a Kotlin Native project with the bare minimum setup alongside an iOS project that embeds the generated Apple framework, and it has the following structure:
```
.
├── build
│   ├── ..
│   └── ..
├── build.gradle.kts
├── gradle
│   └── ...
├── gradlew
├── gradlew.bat
├── iOSPlayground
│   ├── iOSPlayground
│   │   ├── AppDelegate.swift
│   │   ├── Assets.xcassets
│   │   │   ├── ...
│   │   │   └── ...
│   │   ├── Base.lproj
│   │   │   ├── LaunchScreen.storyboard
│   │   │   └── Main.storyboard
│   │   ├── Info.plist
│   │   └── ViewController.swift
│   └── iOSPlayground.xcodeproj
│       ├── ...
│       └── ...
└── src
    ├── commonMain
    │   └── kotlin
    │       └── common.kt
    └── nativeMain
        └── kotlin
            └── ios.kt
```

where `src` directory contains the K/N module and the `iOSPlayground` directory contains the iOS app, inside which there is a file named `ViewController.swift`that contains all the Swift code.

To generate the Apple framework, you have to run `./gradlew linkNative` on the root folder of the project and the generated framework will be produced in the following directory:
```
build/bin/native/debugFramework/Playground.framework
```
 
## Playground

### Functions: high-level, extensions, variadic

Let's start with functions and define three of them in the `common.kt` file. One will be an extension to the `Int` type, one will be a high-level function and the last one will be a variadic function.

```kotlin
fun Int.squared(): Int {
    return this * 2
}

fun highLevelFunction(): String {
    return "I'am a high-level-function"
}

fun average(vararg values: Int): Double {
    return values.average()
}
```

Then, run `./gradlew linkNative` and check the header file (`Playground.h`) from the framework, which is supposed to contain something like the following snippet:

```objc
__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("CommonKt")))
@interface PlaygroundCommonKt : KotlinBase
+ (int32_t)squared:(int32_t)receiver __attribute__((swift_name("squared(_:)")));
+ (NSString *)highLevelFunction __attribute__((swift_name("highLevelFunction()")));
+ (double)averageValues:(PlaygroundKotlinIntArray *)values __attribute__((swift_name("average(values:)")));
@end;
```
Based on the content of this file, we can figure out how to use these functions in a Swift project. For example, we have to use the `CommonKt.` before the functions and the variadic function well... is no longer a variadic function but rather expect a single parameter of type `KotlinIntArray`. An example of using these functions on a Swift project is the following snippet:

```swift
// MARK: - Functions

let squared = CommonKt.squared(2)
print("Square of 2 equals \(squared)")
/// Output: Square of 2 equals 4

print(CommonKt.highLevelFunction())
/// Output: I'am a high-level-function

let array = KotlinIntArray(size: 3)
array.set(index: 0, value: 12)
array.set(index: 1, value: 10)
array.set(index: 2, value: 11)
let average = CommonKt.average(values: array)
print("The average of 12, 10 and 11 is: \(average)")
/// Output: "The average of 12, 10 and 11 is: 11.0
```

### Enumerations

Let's continue to Kotlin's enum classes. For this example, I will make use of an enum with programming languages which will also have a single parameter, the year of the first appearance of each language, like the following snippet:

```kotlin
enum class Languages(val sinceYear: String) {
    OBJC("1984"),
    SWIFT("2014"),
    KOTLIN("2011")
}
```

If you compile to the native framework, you will get the following content on the header file of the framework:

```objc
__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("Languages")))
@interface PlaygroundLanguages : PlaygroundKotlinEnum<PlaygroundLanguages *>
+ (instancetype)alloc __attribute__((unavailable));
+ (instancetype)allocWithZone:(struct _NSZone *)zone __attribute__((unavailable));
@property (class, readonly) PlaygroundLanguages *objc __attribute__((swift_name("objc")));
@property (class, readonly) PlaygroundLanguages *swift __attribute__((swift_name("swift")));
@property (class, readonly) PlaygroundLanguages *kotlin __attribute__((swift_name("kotlin")));
- (instancetype)initWithName:(NSString *)name ordinal:(int32_t)ordinal __attribute__((swift_name("init(name:ordinal:)"))) __attribute__((objc_designated_initializer)) __attribute__((unavailable));
- (int32_t)compareToOther:(PlaygroundLanguages *)other __attribute__((swift_name("compareTo(other:)")));
@property (readonly) NSString *sinceYear __attribute__((swift_name("sinceYear")));
@end;
```
From the ObjC header, it's obvious that the `enum` is not actually an `enum` but a class and each case is a class parameter. 

Given this, an example of how we can use it in a Swift project is the following snippet

```swift
// MARK: - Enums

let swift = Languages.swift
let kotlin = Languages.kotlin

let lang = Languages.objc

print("Swift's first appearance: \(swift.sinceYear) \nKotlin's first appearance: \(kotlin.sinceYear)")
/// Output: Swift's first appearance: 2014
///         Kotlin's first appearance: 2011

if case Languages.swift = lang {
    print("Swift")
} else {
    print("Not Swift")
}
/// Output: Not Swift
```

On the bright side, it turns out that it conforms to the `Comparable` protocol thanks to the `KotlinEnum` class, so we can make use of Swift's `switch` or `if case` statements.

### Sealed Classes & Generics

The next to take a look at are Sealed classes and Generics. Before we move on, is worth mentioning that Generics is a feature added with [Kotlin 1.3.40](https://blog.jetbrains.com/kotlin/2019/06/kotlin-1-3-40-released/) and it is disabled by default. In order to enable this feature, you have to first make sure that you are using a version of Kotlin greater or equal to 1.3.40 and that you add the `freeCompilerArgs.add("-Xobjc-generics")` on your `build.gradle.kts` like in the following snippet.

```groovy
iosX64("native") {
    binaries {
        framework {
            baseName = "Playground"
            freeCompilerArgs.add("-Xobjc-generics")
        }
    }
}
```

For this example, I will make use of the common scenario of a Tree that contains Nodes.

```kotlin
// Sealed class & generic
sealed class Tree<T> {
    data class Node<T>(var value: T,
                       var left: Tree<T> = None(),
                       var right: Tree<T> = None()): Tree<T>()
    class None<T>: Tree<T>()
}
```

The header of the generated framework, after running `./gradlew linkNative`, will be like:

```objc
__attribute__((swift_name("Tree")))
@interface PlaygroundTree<T> : KotlinBase
@end;

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("TreeNode")))
@interface PlaygroundTreeNode<T> : PlaygroundTree<T>
- (instancetype)initWithValue:(T _Nullable)value left:(PlaygroundTree<T> *)left right:(PlaygroundTree<T> *)right __attribute__((swift_name("init(value:left:right:)"))) __attribute__((objc_designated_initializer));
- (BOOL)isEqual:(id _Nullable)other __attribute__((swift_name("isEqual(_:)")));
- (NSUInteger)hash __attribute__((swift_name("hash()")));
- (NSString *)description __attribute__((swift_name("description()")));
- (T _Nullable)component1 __attribute__((swift_name("component1()")));
- (PlaygroundTree<T> *)component2 __attribute__((swift_name("component2()")));
- (PlaygroundTree<T> *)component3 __attribute__((swift_name("component3()")));
- (PlaygroundTreeNode<T> *)doCopyValue:(T _Nullable)value left:(PlaygroundTree<T> *)left right:(PlaygroundTree<T> *)right __attribute__((swift_name("doCopy(value:left:right:)")));
@property T _Nullable value __attribute__((swift_name("value")));
@property PlaygroundTree<T> *left __attribute__((swift_name("left")));
@property PlaygroundTree<T> *right __attribute__((swift_name("right")));
@end;

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("TreeNone")))
@interface PlaygroundTreeNone<T> : PlaygroundTree<T>
- (instancetype)init __attribute__((swift_name("init()"))) __attribute__((objc_designated_initializer));
+ (instancetype)new __attribute__((availability(swift, unavailable, message="use object initializers instead")));
@end;
```

And we can use it as in the following Swift snippet:

```swift
func description(for node: TreeNode<NSString>) -> String {
    var description = "Node '\(node.value as! String)'"

    if node.right is TreeNone<NSString> && node.left is TreeNone<NSString> {
        description.append(" doesn't have any child")
    } else if let leftChild = node.left as? TreeNode<NSString>,
        let rightChild = node.right as? TreeNode<NSString> {

        description.append(" has children '\(leftChild.value as! String)' and '\(rightChild.value as! String)'")
    }

    return description
}

let leftChild = TreeNode<NSString>(value: "Left Child", left: TreeNone(), right: TreeNone())
let rightChild = TreeNode<NSString>(value: "Right Child", left: TreeNone(), right: TreeNone())
let parent = TreeNode<NSString>(value: "Parent", left: leftChild, right: rightChild)

print(description(for: leftChild))
print(description(for: parent))
/// Output: Node 'Left Child' doesn't have any child
///         Node 'Parent' has children 'Left Child' and 'Right Child'
```

> Note that the generic type should be a class, so that's why NSString is used instead of Swift's String.


### Interfaces & Inheritance

The next on the list is interfaces & inheritance. Again, I will use a common example, the shapes. In the following snippet I define an interface and two implementations of it.

```kotlin
// Interfaces / Inheritance

interface Shape {
    fun area(): Float
}

class Square(val side: Float) : Shape {
    override fun area() = side.pow(2)
}

open class Rect(val width: Float, val height: Float) : Shape {
    override fun area() = width * height
}
```

As you may have noticed, one of these implementation classes has the `open` keyword, which means that it can be subclassed. If you don't add the `open` keyword, you will not be able to create a subclass, which is obvious by the ObjC header `objc_subclassing_restricted` attribute. 

```objc
__attribute__((swift_name("Shape")))
@protocol PlaygroundShape
@required
- (float)area __attribute__((swift_name("area()")));
@end;

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("Square")))
@interface PlaygroundSquare : KotlinBase <PlaygroundShape>
- (instancetype)initWithSide:(float)side __attribute__((swift_name("init(side:)"))) __attribute__((objc_designated_initializer));
- (float)area __attribute__((swift_name("area()")));
@property (readonly) float side __attribute__((swift_name("side")));
@end;

__attribute__((swift_name("Rect")))
@interface PlaygroundRect : KotlinBase <PlaygroundShape>
- (instancetype)initWithWidth:(float)width height:(float)height __attribute__((swift_name("init(width:height:)"))) __attribute__((objc_designated_initializer));
- (float)area __attribute__((swift_name("area()")));
@property (readonly) float width __attribute__((swift_name("width")));
@property (readonly) float height __attribute__((swift_name("height")));
@end;
```

The Swift implementation is straight-forward and an example of this could be the following snippet.

```swift
// MARK: - Interfaces & Inheritance

class Circle: Shape {
    func area() -> Float {
        return Float.pi * radius * radius
    }
    let radius: Float

    init(radius: Float) {
        self.radius = radius
    }
}

class DummyRect: Rect {
    override func area() -> Float {
        return width * height * 1.3
    }
}

let square = Square(side: 4)
let rect = Rect(width: 2, height: 2)
let dummyRect = DummyRect(width: 2, height: 2)

let shapes: Array<Shape> = [square, rect, dummyRect]

shapes.forEach { shape in
    print("Shape area is \(shape.area())")
    /// Outputs: Shape area is 16.0
    ///          Shape area is 4.0
    ///          Shape area is 5.2
}
```

The only thing to notice is that we have to define the type of the Array since, by default, an array of type `KotlinBase` is created.

### Expect/Actual keywords a.k.a Platform-Specific code

Often times, we have to provide some platform specific code. For example, we may want to get the device's platform and version. 
To cover for these scenarios we use the `expect`/`actual` keywords. In the `common.kt`, we can declare a class, a function or a variable with the `expect` keyword and keep the body empty, like we would do for an interface. An example of such function is the following snippet.

```kotlin
// Expect
expect fun platformName(): String
```

Now, in the `ios.kt` file, we make use of the `actual` keyword to provide the implementation of the class, function or variable defined with the `expect` keyword

For this example, we will add the following snippet on the `ios.kt` file:

```kotlin
import platform.UIKit.UIDevice

actual fun platformName(): String {
    return UIDevice.currentDevice.systemName() +
            " " +
            UIDevice.currentDevice.systemVersion
}
```

After compiling, the header of the generated framework will look like this: 

```objc
__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("IosKt")))
@interface PlaygroundIosKt : KotlinBase
+ (NSString *)platformName __attribute__((swift_name("platformName()")));
@end;
```

And we can use it in Swift in the following way:

```swift
// MARK: - Platform Specific Code

print("platform is \(IosKt.platformName())")
/// Outputs: platform is iOS 12.4
```

And that's it for this post.

## Wrap-up

To sum up, in this post, we have seen a few cases of how Kotlin features are compiled to Obj-C and how we can use them in a Swift project. As we saw in a few examples, some features are not compiled exactly as we would expect and their usage is not so straight-forward. Therefore, a project like this playground can be really useful in many cases. 

The smaller scope and size of this kind of projects make them suitable for experimenting; be it a new implementation or a new feature introduced on a newer Kotlin version just like I did with the `-Xobjc-generics` argument that I mentioned before. And also they are a good candidate for reference purposes.

Thanks for reading, I hope that you found this post useful and should you have any suggestions on how to enrich this playground or any other questions or comments, just let me know on [Twitter](https://twitter.com/diamantidis_io) or by [email](mailto:diamantidis@outlook.com)!

