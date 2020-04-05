---
layout: post
title: Help your user rate and review your iOS app!
description: A post about the importance of ratings and reviews for an iOS app and how to add them using SKStoreReviewController or an App Store link.
date: 2020-04-05 06:00 +0200
comments: true
tags: [Swift, iOS]
---


Nowadays, more and more users rely on ratings and reviews when they are about to make a purchasing decision, whether it is buying products, deciding on a travel destination, etc. And downloading an app from the App Store could not be an exception to this rule. Having a high rating and many reviews can be a decisive factor on user's decision to download an app.

What are you going to do if you land on the App Store page of an app that seems to fulfill your requirements functionality-wise, but has poor rating and no reviews? Are you going to download it or continue the search, in the hope of finding another app with higher rating and more reviews?
 
On top of that, it is rumored that the rating and number of reviews play an important role on the ranking of your app on App Store's search and category results. This could also lead to increased downloads as more and more user will visit your app's App Store page.  

From all the above, it is quite evident how important having a high rating and many reviews is.

Nevertheless, it's also true that the majority of users who will bother to leave the app and head to the App Store to rate or write a review, are usually the ones who are not satisfied from the app or face an issue while using it.

Contrary, users who have a positive experience while using the app, and who are the ones more likely to leave a high rating and a positive review, will continue using the app but are probably less motivated to make the effort to visit the app's App Store page and rate the app. 

For this reason, it's our responsibility as developers to guide those users to rate the app and this is going to be the topic of this post.


## In app review to the rescue

On `iOS 10.3`, Apple has introduced the [SKStoreReviewController], which provides an easy and native way that allows users to rate and review your app without having to actually leave the app. This is done by presenting a popup that asks the user to rate the app.

Let's see how we can add this in an app. 

## Strategy

As we mentioned before, we want to show the review popup to users who has a positive experience using the app. Engagement could be one metric for this, so in this post we are going to implement a strategy to present the popup three weeks after the user has installed the app and only if the user has opened the app at least 3 times. Furthermore, we are going to check the bundle version of the app to make sure that we are not asking the user to review the same version of the app more than once. 

> One drawback of the `SKStoreReviewController` is that it doesn't support a way of knowing whether the prompt was presented or not. Apple handles this logic and according to the [documentation], the only thing that we know is that the prompt will be displayed at most 3 times in 365 days. 

Let's dive into the implementation!

## Implementation

First, we are going to create a class named `InAppReviewManager` which will be responsible for deciding whether we should trigger the review prompt or not. 

Before we focus on the implementation of the `InAppReviewManager`, let's think about the dependencies. We are probably going to need some storing mechanism to save all the required info (date of first open, number of times the user has opened the app, etc) and we should also be able to retrieve the current version of the app. 

It would also be great to be able to easily test this class since it is going to contain all the business logic, so ideally it should depend on abstractions instead of concrete classes. 

For this reason, we are going to define two protocols (`Storage` and `BundleType`) and provide the required extensions for `UserDefaults` and `Bundle` respectively to adhere to those protocols.

The following snippet contains the definition of `Storage` as well the conformance of `UserDefaults` to it:

```swift
enum StorageKey: String {
    case lastVersionPromptedReview
    case dayOfFirstAction
    case actionCount
}

protocol Storage {
    func integer(forKey key: StorageKey) -> Int
    func set(_ value: Int, forKey key: StorageKey)
    func object(forKey key: StorageKey) -> Any?
    func set(_ value: NSDate, forKey key: StorageKey)
    func string(forKey key: StorageKey) -> String?
    func set(_ value: String, forKey key: StorageKey)
}

extension UserDefaults: Storage {
    func integer(forKey key: StorageKey) -> Int {
        return self.integer(forKey: key.rawValue)
    }

    func set(_ value: Int, forKey key: StorageKey) {
        self.set(value, forKey: key.rawValue)
    }

    func object(forKey key: StorageKey) -> Any? {
        return self.object(forKey: key.rawValue)
    }

    func set(_ value: NSDate, forKey key: StorageKey) {
        self.set(value, forKey: key.rawValue)
    }

    func string(forKey key: StorageKey) -> String? {
        return self.string(forKey: key.rawValue)
    }

    func set(_ value: String, forKey key: StorageKey) {
        self.set(value, forKey: key.rawValue)
    }
}
```

Similarly, in the next snippet, you can find the definition of `BundleType` and the conformance of `Bundle` to it:

```swift
protocol BundleType {
    func object(forInfoDictionaryKey key: String) -> Any?
}

extension Bundle: BundleType {}
```


Now, we can return to the `InAppReviewManager` class and provide the implementation, which can be found in the snippet below: 

```swift
class InAppReviewManager {

    // MARK: - Initializers
    init(storage: Storage = UserDefaults.standard, bundle: BundleType = Bundle.main) {
        self.storage = storage
        self.bundle = bundle
    }

    // MARK: - Public methods
    func shouldAskForReview() -> Bool {

        // Count the number of actions
        var actionCount = storage.integer(forKey: .actionCount)
        actionCount += 1
        storage.set(actionCount, forKey: .actionCount)

        // Store the day of first action
        let dateOfFirstActionObj = storage.object(forKey: .dayOfFirstAction)
        if dateOfFirstActionObj == nil {
            storage.set(NSDate(), forKey: .dayOfFirstAction)
        }

        // Calculate if there have been three weeks since the first action
        let threeWeeksInSeconds: TimeInterval = 3 * 7 * 24 * 60 * 60
        let threeWeeksAgo = Date(timeIntervalSinceNow: -threeWeeksInSeconds)

        guard let dateOfFirstAction = dateOfFirstActionObj as? Date else {
            return false
        }

        let comparisonResult = dateOfFirstAction.compare(threeWeeksAgo)

        // Check if user has reviewed this version
        let bundleVersionKey = kCFBundleVersionKey as String
        guard let bundleVersion = bundle.object(forInfoDictionaryKey: bundleVersionKey) as? String else {
            return false
        }
        let lastVersion = storage.string(forKey: .lastVersionPromptedReview)

        guard case .orderedAscending = comparisonResult, actionCount >= 3, lastVersion == nil || lastVersion != bundleVersion else {
            return false
        }

        storage.set(bundleVersion, forKey: .lastVersionPromptedReview)
        return true
    }

    // MARK: - Private properties
    private let storage: Storage
    private let bundle: BundleType
}
```

In this snippet, we are using the previously defined protocols to inject the dependencies through the initializer. 

Then, we have the `shouldAskForReview()` method which is responsible to decide whether we should ask the user to review the app or not. 

In the body of this method, we first retrieve the action count. In our case, this count represents the times the user has opened the app.

Then, we retrieve the date of the first trigger of the action. If the value of the variable is `nil`, it means that it's the first open, so we are saving the current date.

> I am using `NSDate` because it's easier to manipulate the time and time travel using swizzling.

As we move on, we are calculating what was the day three weeks ago and compare that with the date of the first trigger of the action. 

After that, we are fetching the version of the current app as well as the version of the app the time we last triggered the review. 

Finally, we are checking if all the requirements are met, and if they are, we are updating the version of the app in the storage and return `true` to the caller of the function. Otherwise, we return `false`.


> As I pointed before, Apple will show the review popup only 3 times per 365 days, so the above mention implementation will work just fine. Alternatively, you can enrich the logic and in addition to the existing checks, you can add another one for the number of days that has passed since the last time that we have trigger the review popup.

Now we are ready to use the `InAppReviewManager` like this:

```swift
let manager = InAppReviewManager()
if manager.shouldAskForReview() {
    DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(2)) {
        SKStoreReviewController.requestReview()
    }
}
```

> To be able to use `SKStoreReviewController`, you will have to add `import StoreKit`.

As a result, if you run the app and satisfy the requirements, the app will show the review popup, which looks like the following screenshots:

![Review without star selection screenshot]({{site.url}}/assets/appreviews/review_without_selection.png)    &emsp;    ![Review with star selection screenshot]({{site.url}}/assets/appreviews/review_with_selection.png)

> When in development, you won't be able to review the app. The prompt will appear but you will not be able to submit the review.

These snippets as well as the implementation of some unit tests can be found on GitHub in this [gist].

> There is an option in Settings where a user can disable In-App Ratings and Reviews. This option is not app specific and it affects all the apps.

## Other options

Though `SKStoreReviewController` is a great solution, there are certain scenarios where it is not suitable. 

What if you have to still support versions older than `iOS 10.3`? Or you want to have more control over when you ask the users to rate the app? Maybe you want to have a button on the settings to ask the user to review the app. 

Fortunately, there is a solution. You could lead the users to the iTunes and let them leave a review there. Of course, contrary to `SKStoreReviewController`, this solution requires the user to leave the app, and this is one of the drawbacks that we have to take into consideration. 

iTunes offers a URL that opens the `Write a Review` modal automatically and this is what we can use. The format of the url is the following, where appID is the appID of your app:
```
https://itunes.apple.com/app/id{appID}?action=write-review
```

In the following snippet, you can see an implementation:

```swift
private func showItunesReview(for appID: String) {
    let appURL = "https://itunes.apple.com/app/\(appID)"

    var components = URLComponents(string: appURL)

    components?.queryItems = [
        URLQueryItem(name: "action", value: "write-review")
    ]

    guard let url = components?.url else {
      return
    }

    if UIApplication.shared.canOpenURL(url) {
        UIApplication.shared.open(url)
    }
}
```

As a result, when this function is called, the App Store app will open, showing the screen in the following screenshot.

![App Store "write a review" screenshot]({{site.url}}/assets/appreviews/app_store_review.png)

## Conclusion

And that's about it! In this post, I initially stressed the importance of ratings and reviews for any iOS app. 

Then, we walked through the implementations of two different ways we can use to ask users to rate the app and write a review. 
In the first one, I am making use of `SKStoreReviewController` to trigger the in-app-review prompt, while in the second I am using the `action` query parameter to open the review page on App Store.

Making it easier for your user to rate the app and with the right strategy in place (when, to which users), it will most likely have a positive impact on the App Store presence of your app and it is something I would totally recommend using.

Thanks for reading this post, I hope you find this post useful!
Feel free to reach out to me on [Twitter] and share your comments about this post!


[SKStoreReviewController]: https://developer.apple.com/documentation/storekit/skstorereviewcontroller
[documentation]: https://developer.apple.com/design/human-interface-guidelines/ios/system-capabilities/ratings-and-reviews#system-rating-and-review-prompts

[Twitter]: https://twitter.com/diamantidis_io
[gist]: https://gist.github.com/diamantidis/7c615a886acb04b87428a81f9c1029b8
