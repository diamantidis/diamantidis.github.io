---
layout: post
title: Use AppleScript to generate an enum for SF Symbols
description: Use SF Symbols in a type-safe manner with an enum generated with AppleScript
date: 2020-06-28 06:00 +0200
tags: [AppleScript, "SF Symbols"]
image:
    path: /assets/social/applescript-to-generate-enum-for-sf-symbols.png
    width: 683
    height: 512
twitter:
    card: summary_large_image
---

[SF Symbols] is a great way to add symbols in apps. Introduced during WWDC 2019, and with a new updated version this year, the [SF Symbols] app now provides more than 2300 symbols, supports iOS, Mac Catalyst, tvOS, and watchOS and now macOS, and offers many more features, like multicolor support, RTL, etc.

But despite its greatness, it comes with some shortcomings when we have to use those symbols from an app.
The provided APIs expect a hard-coded string literal for the name of the `SF Symbol`. This makes their usage susceptible to errors since we will not get notified by the compiler if we accidentally mistype the name.

Wouldn't it be much better if we were to have a type-safe solution? Maybe an enum?

That's the problem we will try to solve in this post. We will create a script using `AppleScript` which will open the `SF Symbols` app, traverse the list of symbols and generate an enum with a case for each symbol.

## Script Overview

To start with, we will use the `Script Editor` app to write the `AppleScript`. Before we start writing the script, let's try to figure out the steps we will take on the `SF Symbols` app. First, we will open the app. Then, we will select the list layout. Choosing the list layout instead of the grid will make it much easier to traverse the list of symbols.

After that, we will select the option `All` from the `Categories` menu to make sure that the output will contain the full list of options. Then, we will loop through the symbols, and for each one, we will create an enum case of the format `case <name> = <sf symbol name>`.

Let's see the script!

## Preparation

We will first define some helper functions to compute the identifier that we will use for the case.

This identifier should be a valid one, so we have to cater for some edge cases. In some cases, the names of some SF Symbols are reserved keywords in Swift, like `return` and `repeat`. Since we cannot use those words for the case identifier, we will escape them with the `backtick` symbol (``` ` ```).

```applescript
on convertReservedKeywords(theText)
    set keywords to {"repeat", "return", "case"}
    set theNewText to theText

    if keywords contains (theText as string) then
        set theNewText to "`" & theText & "`"
    end if

    return theNewText
end convertReservedKeywords
```

Another such case is the `SF Symbols` starting with a number literal, like `0.square`. In that scenario, we will prepend the name with the string literal `number`.


```applescript
on handleNameRestrictions(theText)
    set theNewText to theText
    set firstCharacter to text 1 of theText
    if isNumber(firstCharacter) then
        set theNewText to "number" & theText
    end if

    return convertReservedKeywords(theNewText)
end handleNameRestrictions

on isNumber(theString)
    try
        set theString to theString as number
        return true
    on error
        return false
    end try
end isNumber
```

Also, as you may have noticed, a lot of the `SF Symbols` are using the dot (`.`) on their name, which is another invalid character for the case identifier. To solve this issue, we will convert the name of the symbol to a camelCase string that we will use as the identifier. To do so, we will remove the dot and instead capitalize the first letter after the dot.

```applescript
on toCamelCase(theText)
    set theNewText to ""
    set dotIsFound to false
    repeat with aCharacter in theText
        if (aCharacter as string) is equal to "." then
            set dotIsFound to true
        else
            if dotIsFound then
                set theNewText to (theNewText & toCapitalized(aCharacter)) as string
            else
                set theNewText to theNewText & aCharacter
            end if
            set dotIsFound to false
        end if

    end repeat

    return theNewText
end toCamelCase

on toCapitalized(theText)
    set theNewText to ""

    set theComparisonCharacters to "abcdefghijklmnopqrstuvwxyz"
    set theSourceCharacters to "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    set firstCharacter to text 1 of theText

    set stringLength to the length of theText
    set restOfText to ""
    if stringLength is greater than 1 then
        set restOfText to text 2 thru -1 of theText
    end if

    set theOffset to offset of firstCharacter in theComparisonCharacters
    if theOffset is not 0 then
        set theNewText to (theNewText & character theOffset of theSourceCharacters & restOfText) as string
    else
        set theNewText to (theNewText & firstCharacter & restOfText) as string
    end if
    return theNewText
end toCapitalized
```

## Implementation

With all those functions in place, we can now shift our focus on the part of our program that will interact with the `SF Symbols` app.

 ```applescript
activate application "SF Symbols"

tell application "System Events"
    tell process "SF Symbols"

        -- Click the “list” radio button.
        click radio button 2 of radio group 1 of group 3 of toolbar 1 of window 0

        tell outline 1 of scroll area 1 of splitter group 1 of window 0
            select (row 1 where value of static text 1 of UI element 1 starts with "All")
        end tell

        set enumCases to ""

        repeat with sfSymbolRow in rows of table 1 of scroll area 1 of group 1 of splitter group 1 of window 0

            set sfSymbolName to value of static text 1 of UI element 2 of sfSymbolRow

            set caseIdentifier to my toCamelCase(my handleNameRestrictions(sfSymbolName))
            set enumCases to enumCases & "	case " & caseIdentifier & " = \"" & sfSymbolName & "\"
"
        end repeat

        set startOfEnum to "public enum SFSymbol: String, CaseIterable {
"
        set endOfEnum to "}"
        set enum to startOfEnum & enumCases & endOfEnum

        set the clipboard to {text:(enum as string), Unicode text:enum}
        enum
    end tell
end tell
 ```


In this snippet, we initially select the list layout and the option `All` from the `Categories` as we explained earlier. Then, we create a string variable that will gather all the enum cases.
After that, we loop through the `SF Symbols`, and for each one of them, we use the functions we defined earlier to compute the identifier of the case. Then, we append a new case to the string we defined outside of the loop.

After the loop, we will define two more variables that will contain the definition and the trailing bracket of the enum respectively. We will then, merge those three variables to construct a variable with the final version of the enum.

Finally, we will add this to the clipboard to make it easier to paste on the project and use it as the output of the script.

And that's about it when it comes to the script!

## But what about SF Symbols 2?

This script is also compatible with the new version of the `SF Symbols` app with only a minor change. Just replace the two occurrences of `"SF Symbols"` to `"SF Symbols beta"`.

A word of caution, though: be extra careful because there are some new `SF Symbols` that are only available on the latest OS versions while some others like the `bin.xmark` are deprecated in favor of new ones (`xmark.bin`).

> You can find the script as well as the enums generated from both the `SF Symbols` and `SF Symbols 2` app on [this GitHub Gist](https://gist.github.com/diamantidis/7dfa8de52aa2f36a3c64ff30a16dd22a).

Let's now see how we can run it!

## How to run

You can use either the `Script Editor` app or the `Terminal` app. If you use the `Script Editor` app, press the play button or use the shortcut Command (`⌘`) + R.

If you decide to run the script from the `Terminal`, you can use the command `osascript <name of the script>.scpt`. The output of this command will be the enum, which you can redirect to a Swift file on your project: `osascript <name of the script>.scpt > GeneratedSFSymbols.swift`.


 > :bulb: **TIP**: You can place the script on a specific folder and then use the absolute path of this folder to create an alias on your `~/.bash_profile` or `~/.zshrc` file. <br><br> `alias sfsymbols='<path to the script>/<name of the script>.scpt'`. <br><br> This will allow you to run this script with ease from any project: `sfsymbols > GeneratedSFSymbols.swift`



> :grey_exclamation: **INFO**: Regardless of how you run the script, you will probably get a prompt to grant Accessibility Access like in the following screenshot. To grant the required access, go to `System Preferences` > `Security & Privacy` > `Privacy` > `Accessibility` and select the program that you are using to run the script.  ![AppleScript warning screenshot]({{site.url}}/assets/sf_symbols_applescript/apple_script_warning.png)


Now that we have added the enum in our project, it's time to find out how we can use it!

## How to use

You can simply add an extension for the component you are interested in.

For example, if you are using SwiftUI, you can add an extension to the `Image` struct:

```swift
import SwiftUI

@available(iOS 13.0, macOS 10.15, tvOS 13.0, watchOS 6.0, *)
public extension Image {
    /// Creates an image object containing a system symbol image.
    ///
    /// - Parameter sfSymbol: The name of the `SFSymbol`
    /// - Usage
    ///   ```
    ///   Image(sfSymbol: .checkmarkCircleFill)
    ///   ```
    @available(OSX, unavailable)
    init(sfSymbol: SFSymbol) {
        self.init(systemName: sfSymbol.rawValue)
    }
}
```


Similarly, if you are using UIKit's UIImage, you can use the following extension:
```swift
import UIKit

@available(iOS 13.0, *)
public extension UIImage {
    /// Creates an image object containing a system symbol image.
    ///
    /// - Parameter sfSymbol: The name of the `SFSymbol`
    /// - Usage
    ///   ```
    ///   UIImage(sfSymbol: .checkmarkCircleFill)
    ///   ```
    convenience init?(sfSymbol: SFSymbol) {
        self.init(systemName: sfSymbol.rawValue)
    }
}
```

## Conclusion

And that's about it! In this post, we have seen how we can utilize the ability of AppleScript to interact with other macOS apps to generate an enum for all the symbols on the `SF Symbols` app.
This will alleviate all the pains that come with the use of an error-prone string literal when we create an Image based on an `SF Symbol`. Instead, with this enum we will be able to create those Images in a type-safe manner.

Thanks for reading, I hope you find this post useful.

If you like this post and you want to get notified when a new post is published, you can follow me on [Twitter] or subscribe to the [RSS feed].

Also, if you have any questions or comments about this post, feel free to contact me on [Twitter]!

Until next time!

[SF Symbols]: https://developer.apple.com/design/human-interface-guidelines/sf-symbols/overview/

[RSS feed]: {{ "feed.xml" | absolute_url }}
[Twitter]: https://twitter.com/diamantidis_io
