---
layout: post
title: Setting up a new iOS project (Part II)
description: A post about the steps I take every time I create a new iOS project (fastlane, Continuous Integration, custom Xcode templates, R.swift)
date: 2020-05-03 06:00 +0200
comments: true
tags: [iOS, CI, fastlane, "R.Swift"]
---

This is the second part of a series of posts about the steps that I usually take when creating a new iOS project.

In the [first part]({%post_url 2020-04-26-setting-up-an-ios-project-part-i %}) I wrote about `.gitignore`, `Bundler`, `CocoaPods`, `Configurations` and `SwiftLint`.

Now, in this second part I will try to elaborate on topics like `Fastlane`, `Continuous Integration`, architectural decisions, custom Xcode templates and `R.swift`, a tool which allows you to use strong typed resources. 

Let's go!!

## [fastlane]

`fastlane`, is a tool to automate tasks like running tests, linting, setting up provisioning profiles, deployments, etc


`fastlane` is a RubyGem, so, if we want to install it, we will have to add the following line on the `Gemfile` and run `bundle install`.
```ruby
gem 'fastlane', '~>2.145.0'
``` 

Once installed, run `bundle exec fastlane init` to create the `fastlane` folder and some basic files. One of them is the `Fastfile`, which is the file where we define our tasks. In fastlane's terminology, they are called lanes.


A basic `Fastfile`, that I use on my projects, looks like the following snippet: 

```ruby
default_platform(:ios)

APP_WORKSPACE = "<YOUR_APP>.xcworkspace"

TEST_DEVICES = ["iPhone 11"]

platform :ios do
  desc "Run iOS unit tests"
  lane :unit_tests do
    run_tests(
        workspace: APP_WORKSPACE,
        devices: TEST_DEVICES,
        derived_data_path: "../build",
        build_for_testing: true
    )
  end

  desc "Run linting"
  lane :lint do
    swiftlint(
      executable: './Pods/SwiftLint/swiftlint',
      mode: :lint,
      config_file: '.swiftlint.yml',
    )
  end

  desc "Run lint autocorrect"
  lane :lint_autocorrect do
    swiftlint(
      mode: :autocorrect,
      executable: './Pods/SwiftLint/swiftlint',
      config_file: '.swiftlint.yml',
    )
  end

  desc "Increment major version and push to git"
  lane :increment_major_version do
    increment_version_number(
      bump_type: "major"
    )
    commit_version_bump
  end

  desc "Increment minor version and push to git"
  lane :increment_minor_version do
    increment_version_number(
      bump_type: "minor"
    )
    commit_version_bump
  end

  desc "Increment patch version and push to git"
  lane :increment_patch_version do
    increment_version_number(
      bump_type: "patch"
    )
    commit_version_bump
  end
end
```

This example contains some lanes for testing, lint and version handling, and we can use the command `bundle exec fastlane ios <name of the lane>` to run them.

> **Hint**: When running the lanes to increment the version number, if you get an error saying `Your current version ($(MARKETING_VERSION)) does not respect the format A or A.B or A.B.C`), try to run `xcrun agvtool new-marketing-version 0.0.1`.

When time comes to send a build to `TestFlight` or some other beta testing tool, I add those lanes as well. In that case, fastlane's `match` action has proven invaluable when it comes to iOS code signing.

As you may assume, `fastlane` can help immensely when setting up Continuous Integration(`CI`) and Continuous Delivery(`CD`) pipelines and that is going to be the next topic.

## CI/CD

As part of the `CI` pipeline, we can use the lanes for testing and lint and trigger it on the open Pull Requests (PRs).

Once the PR is merged, we can trigger the `CD` pipeline and run the lanes to build the app and distribute a new build either to TestFlight or any other tool you may use for beta testing. 

I won't delve deeper on one specific tool, as there are a lot of options out there to choose from, like for example [GitHub Actions], [GitLab CI], [Travis], [Jenkins] and many more.

Despite that, with the `fastlane` setup in place, it would be a much easier task to set it up, regardless of what tool you decided to use in your project. 


## Architectural Decisions

After that, it's time to think about the architecture of the project. There is a plethora of options to choose from like `MVC`, `MVVM`, `VIPER`, etc and each one of those comes with its pros and cons. 

Then, we have to decide on the UI framework that we are going to use. Will it be `UIKit` or `SwiftUI`?

And quite related to this is the decision regarding the minimum iOS version that the app will support, especially if we decide to go with `SwiftUI` which is only available on iOS 13.0 or later.

Contrary, if we decide to go with `UIKit`, another decision revolves around the usage of Storyboards, XIB files or solely programmatic views. 


All those decisions are quite crucial and will impact the future of the project.

## File Templates

Having taken all these decisions, it is time to think about adding some custom file templates tailored to your need and the architectural choices that you made.

When creating a new file, `Xcode` offers some options to choose from, like `Cocoa Touch Class` for example. However, it's usually the case that every time you create a new file, you add some boilerplate code to cater for the architectural pattern that you have chosen to use. For example, such boilerplate code can be related to dependency injection. 

Hopefully, `Xcode` supports the use of custom file templates that you can create based on your use case. This can be really valuable in the long run as it will save you time of typing(or removing) boilerplate code, help you avoid potential errors and also make the codebase more consistent. 

If you want to find out more about how to create and use a custom `Xcode` template, you can refer to my [detailed step-by-step guide about custom Xcode templates]({%post_url 2019-07-21-xcode-custom-templates %}).

## [R.swift]

Last but not least in my list for this post is [R.swift], which is a tool to get strong typed resources. 

To install it, we are going to use CocoaPods. Let's open the `Podfile`, add `pod 'R.swift', :configurations => ['Debug']` and run `bundle exec pod install` to install it. 

Once completed, open the `.xcworkspace` of your project and head over to the build phases of your app's target. There, add a `New Run Script Phase` which you have to drag and place it above the `Compile Sources` phase and below `Check Pods Manifest.lock` phase. Then, expand it and add the following snippet as the script content:

```sh
"$PODS_ROOT/R.swift/rswift" generate "$SRCROOT/<YourApp>/R.generated.swift"
```
Add `$TEMP_DIR/rswift-lastrun` to the `Input Files` and `$SRCROOT/<YourApp>/R.generated.swift` to the `Output Files` of the Script Phase.

We are now ready to build the app. Once the app is built, the aforementioned script will have created a new file on the location that you specified as the argument. You can change that location, but if you do so, don't forget to change the value of the `Output Files` as well, or else you will get an error. 

Change it or not, open this directory using the Finder app, find the `R.generated.swift` and drag it into your project. At this point, make sure that the `Copy items if needed` checkbox is not selected.

And that's it. Now you can take advantage of `R.swift` syntax and access your strings, fonts, colors, images, etc like in the following snippet:

```swift
let font = R.font.customFont(size: 12)
let string = R.string.app.hello()
let color = R.color.blue()
let image = R.image.anImage())
```

> If you are interested to learn more, you can visit the [R.swift's GitHub page].


## Conclusion

And that's about it for now. In these two posts ([Part I here]({%post_url 2020-04-26-setting-up-an-ios-project-part-i %})), I enumerated most of the steps that I take when creating a new iOS project. 

With this list in place, I am more confident that I will have a proper setup before even starting writing any code. It's like the checklist that pilots use prior to the take off. :rocket: :smirk:


Thanks for reading this post, I hope you find it useful!

I am really interested to know the steps that you take, so if you want to share them with me, or you have any other comment or question about this post, feel free to reach out to me on [Twitter]!!



[fastlane]: https://fastlane.tools/

[GitHub Actions]: https://github.com/features/actions
[GitLab CI]: https://docs.gitlab.com/ee/ci/
[Travis]: https://travis-ci.com/
[Jenkins]: https://www.jenkins.io/


[R.swift]: https://github.com/mac-cain13/R.swift
[R.swift's GitHub page]: https://github.com/mac-cain13/R.swift/blob/master/Documentation/Examples.md

[Twitter]: https://twitter.com/diamantidis_io
