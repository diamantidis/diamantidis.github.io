---
layout: post
title: Notifying users when an iOS app update is available on AppStore
description: A post about the importance of being able to prompt users to update their app to the latest version and how to implement it on an iOS app
date: 2020-04-12 06:00 +0200
comments: true
tags: [Swift, iOS]
---

Have you ever been into a situation where you would love to see all of your users to update to the latest version of your app?

Certain situation such as a serious crash that is fixed, the end of the support for a feature, or a breaking change on the API may make an older version of the app no longer supported, and though most of the users have the auto-update on, there is still a small but still decent percentage who has opted out.
 
This situation is not the ideal to be in, but there are still things you can do and it's better to be prepared and your app to support a functionality that will "force" the users to update to the latest version available on the App Store.

Besides that, even if you don't face this kind of issues, it's always nice to remind your users that a new version is out, and that by downloading it, they will be able to enjoy all the latest features, bug fixes, better performance or whatever change may have happened in the latest version.

So, long story short, in this post, we are going see how we can implement such a solution by fetching from iTunes some information about the latest version of the app and then use it to decide whether we should force or suggest our users to update the version of the app they are using.

## Solution
First thing first, we have to decide on the strategy we are going to follow. 

For this post, we are going to present an alert that will inform the users that they must update the version in case of a major release (the major part of the version has increased). Instead, if either the minor or patch version is increased, we are going to show an informative alert, but this time the user will have the option to dismiss it and not update the app. 

Furthermore, in both scenarios we are going to show the alert if and only if the version is released 7 days ago or more, to cater for [phased roll-out] and also give ourselves some time to identify if there is any potential issues with the latest release and fix them before asking all our users to update the app.

You could also wrap all this logic with some feature toggle mechanism. One such option which is also easy to integrate is [Firebase Remote Config]. If you are interested to learn more, you can visit my previous posts on [how to set it up] and [how to add it on your iOS app].

## Implementation

Let's start with where we can fetch the information about the latest release from iTunes. There is a URL in the format `http://itunes.apple.com/lookup?bundleId={bundleId}`, where `{bundleId}` is the Bundle Identifier of your app. The result of this URL is a file with a JSON object which amongst other contains information like the current version of the app, the date of the last release, the release notes, etc.


So, the first thing that we are going to do in the app is to implement the corresponding models to decode this information. We are going to introduce 3 models: `iTunesInfo` which represent the external JSON object, `AppInfo` which represents the information about the app, like the version and date of the current release and lastly, `Version` which represent the version of the app in three `Int` properties, major, minor and patch. 

The following snippet contains the implementation for all these 3 models:

```swift
import Foundation

struct iTunesInfo: Decodable {
    var results: [AppInfo]
}

struct AppInfo: Decodable {
    var version: Version
    var currentVersionReleaseDate: Date
}

struct Version: Decodable {
    // MARK: - Enumerations
    enum VersionError: Error {
        case invalidFormat
    }

    // MARK: - Public properties
    let major: Int
    let minor: Int
    let patch: Int

    // MARK: - Initializers
    init(from decoder: Decoder) throws {
        do {
            let container = try decoder.singleValueContainer()
            let version = try container.decode(String.self)
            try self.init(from: version)
        } catch {
            throw VersionError.invalidFormat
        }
    }

    init(from version: String) throws {
        let versionComponents = version.components(separatedBy: ".").map { Int($0) }
        guard versionComponents.count == 3 else {
            throw VersionError.invalidFormat
        }

        guard let major = versionComponents[0], let minor = versionComponents[1],
            let patch = versionComponents[2] else {
                throw VersionError.invalidFormat
        }

        self.major = major
        self.minor = minor
        self.patch = patch
    }
}
```


Then, let's move on to the implementation of the `AppUpdateManager`, which will be responsible about the decision of whether we will prompt the users to update the app, and what time of update is it (required or optional). The implementation will be like the snippet below:

```swift
import Foundation

class AppUpdateManager {

    // MARK: - Enumerations
    enum Status {
        case required
        case optional
        case noUpdate
    }

    // MARK: - Initializers
    init(bundle: BundleType = Bundle.main) {
        self.bundle = bundle
    }

    // MARK: - Public methods
    func updateStatus(for bundleId: String) -> Status {

        // Get the version of the app
        let appVersionKey = "CFBundleShortVersionString"
        guard let appVersionValue = bundle.object(forInfoDictionaryKey: appVersionKey) as? String else {
            return .noUpdate
        }

        guard let appVersion = try? Version(from: appVersionValue) else {
            return .noUpdate
        }

        // Get app info from App Store
        let iTunesURL = URL(string: "http://itunes.apple.com/lookup?bundleId=\(bundleId)")

        guard let url = iTunesURL, let data = NSData(contentsOf: url) else {
            return .noUpdate
        }

        // Decode the response
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        guard let response = try? decoder.decode(iTunesInfo.self, from: data as Data) else {
            return .noUpdate
        }

        // Verify that there is at least on result in the response
        guard response.results.count == 1, let appInfo = response.results.first else {
            return .noUpdate
        }

        let appStoreVersion = appInfo.version
        let releaseDate = appInfo.currentVersionReleaseDate

        let oneWeekInSeconds: TimeInterval = 7 * 24 * 60 * 60
        let dateOneWeekAgo = Date(timeIntervalSinceNow: -oneWeekInSeconds)

        // Decide if it's a required or optional update based on the release date and the version change
        if case .orderedAscending = releaseDate.compare(dateOneWeekAgo) {
            if appStoreVersion.major > appVersion.major {
                return .required
            } else if appStoreVersion.minor > appVersion.minor {
                return .optional
            } else if appStoreVersion.patch > appVersion.patch {
                return .optional
            }
        }
        return .noUpdate
    }

    // MARK: - Private properties
    private let bundle: BundleType
}
```

Firstly, we define an enumeration which represent the 3 different options regarding the update; it could be `required`, `optional`, or there is no need to update right now.

Then, we provide an initializer which is used to inject the dependency. We need to fetch the version of the running app, and instead of directly using the `Bundle.main`, we inject a property which conforms to the protocol `BundleType`. In this way, we could later provide a mock implementation and write some unit tests. 


The following snippet contains the definition of `BundleType` as well the conformance of `Bundle` to it:
```swift
protocol BundleType {
    func object(forInfoDictionaryKey key: String) -> Any?
}

extension Bundle: BundleType {}
```

Going back to the `AppUpdateManager` class, we have the `updateStatus` method. In its body, we start by getting the version of the running app. Then, we fetch the app info from iTunes using the URL we mentioned before and decode the response. 
As we move on, we are calculating what was the day one week ago.

Last, using the release date, the version we fetched from iTunes, the day one week ago and the version of the app that's running, we implement the logic of our strategy and return the corresponding status. 

And that's about the `AppUpdateManager`. Before we see how we can use it, we have to decide on how we are going to present this information to the user. For this reason, we are going to need two extensions.

The first one will be responsible for opening the AppStore page for the app so that the users can update the app. We are going to add it as an extension to `UIApplication` and its implementation is in the following snippet:

```swift
extension UIApplication {
    func openAppStore(for appID: String) {
        let appStoreURL = "https://itunes.apple.com/app/\(appID)"
        guard let url = URL(string: appStoreURL) else {
            return
        }

        DispatchQueue.main.async {
            if self.canOpenURL(url) {
                self.open(url)
            }
        }
    }
}
```

The second one, will be responsible of creating a `UIAlertController` based on the value returned from the `updateStatus` method. For this reason, we are going to provide a convenience initializer to the `UIAlertController` and in the snippet below you can find the implementation: 

```swift
extension UIAlertController {
    convenience init?(for status: AppUpdateManager.Status) {
        if case .noUpdate = status {
            return nil
        }

        self.init()
        self.title = "App Update"

        let updateNowAction = UIAlertAction(title: "Update now", style: .default) { _ in
            let appId = "idXXXXXXXXXX" // Replace with your appId
            UIApplication.shared.openAppStore(for: appId)
        }

        self.addAction(updateNowAction)

        if case .required = status {
            self.message = "You have to update the app."
        } else if case .optional = status {
            self.message = "There is a new version of the app."
            let cancelAction = UIAlertAction(title: "Not now", style: .cancel)
            self.addAction(cancelAction)
        }
    }
}
``` 


Now, with everything set up, we can move to one `UIViewController` and add the following snippet, to present the alert if an update is available on AppStore:

```swift
let bundleId = "com.example.yourapp"
let appUpdater = AppUpdateManager()
let updateStatus = appUpdater.updateStatus(for: bundleId)

if let alertController = UIAlertController(for: updateStatus) {
    self.present(alertController, animated: true)
}
```

> If your app is not yet available on the App Store, you can use the bundleID of another app. Here is [a list of the bundleID of Apple's apps].

All these snippets as well as the implementation of some unit tests can be found on GitHub in this [gist].

## Result

The outcome of this implementation will look like the following screenshots depending on the AppStore's and your app's version:

![Optional Update alert screenshot]({{site.url}}/assets/app_updates/optional_update.png)    &emsp;    ![Required Update alert screenshot]({{site.url}}/assets/app_updates/required_update.png)

Of course, in your app you could use a different UI component to present the information and maybe follow a different strategy and define your own set of rules on whether the app should present the update prompt or not.

> FYI, there is an open-source project named [Siren] which you could alternatively use.

As a side note, it seems that Android already offers a solution for [in-app-updates], so hopefully, I can see it coming on iOS soon, and then we will not have to force the users to open AppStore to make the update.

## Conclusion

And that's about it! In this post, we have seen how we can notify the users of an iOS app when a new update is available on the AppStore. First we have seen why it important to act proactively and support such a feature so that it is available by the time we need it and then we have walked through the steps needed to develop such a solution.

I hope that by adding this feature in your app more and more users will move to the latest version.

Thanks for reading this post, I hope you find it useful!
Feel free to follow me on [Twitter] and share your comments about this post!


[phased roll-out]: https://help.apple.com/app-store-connect/#/dev3d65fcee1
[Firebase Remote Config]: https://firebase.google.com/docs/remote-config
[how to set it up]: https://diamantidis.github.io/2019/06/22/firebase-remote-config-ab-testing
[how to add it on your iOS app]: https://diamantidis.github.io/2019/06/30/firebase-remote-config-iOS-implementation


[in-app-updates]: https://developer.android.com/guide/playcore/in-app-updates
[a list of the bundleID of Apple's apps]: https://support.apple.com/guide/mdm/ios-and-ipados-bundle-ids-mdm90f60c1ce/web
[gist]: https://gist.github.com/diamantidis/fa7a5d4dce336e5b8f83827cb229fa9c

[Siren]: https://github.com/ArtSabintsev/Siren
[Twitter]: https://twitter.com/diamantidis_io