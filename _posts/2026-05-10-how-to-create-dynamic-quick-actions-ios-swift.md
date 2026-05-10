---
layout: post
title: How to Create Dynamic Quick Actions in iOS
description: "Learn how to create dynamic home screen quick actions in iOS using UIApplicationShortcutItem - with a practical example of adding a feedback shortcut that opens the mail client when users long-press your app icon"
date: 2026-05-10 11:00 +0200
tags: [Swift, SwiftUI, iOS]
image:
    path: /assets/social/dynamic-quick-actions.png
    width: 990
    height: 512
twitter:
    card: summary_large_image
---

Recently I was thinking about gathering user feedback, and I wanted to focus more on the segment of users who aren't happy with the app, the ones who want to delete it. I tried to find a way to get some comments from those users and learn more about their experience. Then I had an aha moment: Duolingo's fun quick action on hard press that says something like "You can't hide from me?". What if I added a quick action like that to my app? Even if one unhappy user gives me feedback, it's a win.

So here's how to set up dynamic quick actions in your own iOS app.

## Static vs Dynamic Quick Actions

There are two ways to add quick actions: static and dynamic. Both appear when the user long-presses your app icon, but they are configured differently and serve different purposes.

Static quick actions are defined in your app's `Info.plist`. They are loaded by the system automatically and remain the same as long as the app is installed. They are very easy to set up and require no code, but they cannot be changed at runtime, cannot adapt to user state, and are harder to reuse across multiple apps.

On the other hand, dynamic quick actions are created programmatically using `UIApplicationShortcutItem`. They are configured at runtime, which means your app can update them whenever necessary. This allows you to adapt actions based on user preferences, remote config, or app state, and makes it easy to reuse the same logic across multiple apps. And that's exactly what we are going to focus on in this post.

## Dynamic Quick Actions with UIApplicationShortcutItem

To create a dynamic quick action, instantiate `UIApplicationShortcutItem` and assign it to `UIApplication.shared.shortcutItems`:

```swift
let shortcut = UIApplicationShortcutItem(
            type: "com.feedback.action",
    localizedTitle: "Send Feedback",
    localizedSubtitle: "Help us improve",
    icon: UIApplicationShortcutIcon(systemImageName: "envelope"),
    userInfo: [
        "email": "support@example.com" as NSString,
        "subject": "App Feedback" as NSString
    ]
)

UIApplication.shared.shortcutItems = [shortcut]
```

The `type` is a string you define to identify the action when it's triggered. `localizedTitle` and `localizedSubtitle` are what the user sees. The `icon` uses an SF Symbol, and `userInfo` carries any extra data you need when handling the action.

### Where to register the shortcut

To register the shortcut when the app launches, use a `UIApplicationDelegateAdaptor` and set the shortcuts in `application(_:didFinishLaunchingWithOptions:)`:

```swift
class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let shortcut = UIApplicationShortcutItem(
            type: "com.feedback.action",
            localizedTitle: "Send Feedback",
            localizedSubtitle: "Help us improve",
            icon: UIApplicationShortcutIcon(systemImageName: "envelope"),
            userInfo: [
                "email": "support@example.com" as NSString,
                "subject": "App Feedback" as NSString
            ]
        )
        application.shortcutItems = [shortcut]
        return true
    }
}

@main
struct MyApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

If you build and run the app now, long-pressing the app icon will show the "Send Feedback" quick action. But if you tap it, the app will just launch as if you tapped the icon normally. That's because we haven't handled the quick action yet.

## Handling Quick Actions

There are two states to consider when handling a quick action tap: the app can be launched from a terminated state, or it can already be running. Each state is handled by a different method in the `SceneDelegate`.

First, let's extract the logic for opening the mail client into a helper function so we can reuse it in both cases:

```swift
@discardableResult
func handleShortcut(_ shortcutItem: UIApplicationShortcutItem) -> Bool {
    guard shortcutItem.type == "com.feedback.action" else { return false }

    guard let userInfo = shortcutItem.userInfo,
          let email = userInfo["email"] as? String,
          let subject = userInfo["subject"] as? String else { return false }

    let mailtoURL = URL(string: "mailto:\(email)?subject=\(subject.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? subject)")!

    guard UIApplication.shared.canOpenURL(mailtoURL) else { return false }
    UIApplication.shared.open(mailtoURL)
    return true
}
```

Now we can use this function from a `SceneDelegate`. For the first case, when the app is launched from a terminated state, we check `connectionOptions.shortcutItem` in `scene(_:willConnectTo:options:)`. For the second case, when the app is already running, we use `windowScene(_:performActionFor:completionHandler:)`. The final code looks like this:

```swift
final class SceneDelegate: NSObject, UIWindowSceneDelegate {
    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        if let shortcutItem = connectionOptions.shortcutItem {
            handleShortcut(shortcutItem)
        }
    }

    func windowScene(
        _ windowScene: UIWindowScene,
        performActionFor shortcutItem: UIApplicationShortcutItem,
        completionHandler: @escaping (Bool) -> Void
    ) {
        completionHandler(handleShortcut(shortcutItem))
    }
}
```

And that's it! Now if you try to press the quick action again, the default mail client of your iPhone will be launched.

## Conclusion

To sum up, dynamic quick actions give you the flexibility that static `Info.plist` entries can't, without much more effort! In this post, we used them to ask for feedback from unhappy users right before they uninstall the app, but the same approach works for any action you want to surface on the home screen. And the best part is that setting up the shortcut and the handlers is just plain Swift, which means we can export it into a Swift Package and reuse it across multiple apps. Thanks for reading! If you found this post useful, consider [buying me a coffee] to support the blog. For questions or comments, feel free to reach out on [X]!

Until next time!

[buying me a coffee]: https://www.buymeacoffee.com/diamantidis
[X]: https://x.com/diamantidis_io
