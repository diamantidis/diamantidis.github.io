---
layout: post
title: "Kotlin Multiplatform Project: Code styling for iOS and Android"
description: How to install, configure and use tools like SwiftLint, Detekt to lint the iOS app, the Android app and the shared library on a Kotlin Multiplatform Project
date: 2019-09-01 08:00 +0200
comments: true
tags: [iOS, Android, KMP, fastlane, SwiftLint, Detekt]
---

Continuing my journey on Kotlin Multiplatform Project, this time I will explore some tools that can be used to apply code style conventions on such projects. How many times have you ended up with a bunch of unused import on an Android project or using for example `array.count == 0` instead of `array.isEmpty` on an iOS app?

Linting is here to help you alleviate those scenarios and eventually increase readability of your code base, make it more consistent in case your are working on a team and eliminate the code smells.

For this post, I will make use of the project created on the previous posts related to Kotlin Multiplatform Project, about [setting up a project]({% post_url 2019-08-04-setup-kotlin-multiplatform-project %}), [applying some changes in the default structure]({% post_url 2019-08-17-thoughts-on-kotlin-multiplatform-project-structure %}) and [setting up unit tests]({%post_url 2019-08-25-kotlin-multiplatform-project-unit-tests-for-ios-and-android %}). This project is also available on [GitHub](https://github.com/diamantidis/KMP_base).

Since the project consists of two languages (`Swift` and `Kotlin`), we will have to implement different solutions for each of them. 
Tools like [SwiftLint](https://github.com/realm/SwiftLint) for Swift projects and [detekt](https://github.com/arturbosch/detekt) for Kotlin projects enable us to set some rules that we would like our codebase to follow and let us know in case we break some of them.

Without further ado, let's move to action starting from the iOS project and setting up SwiftLint.

## Swift code styling

A while ago, I have written [a post about SwiftLint]({% post_url 2018-12-23-a-guide-to-swiftlint %}), so I will not go in depth, but rather focus on installing, configuring and using SwiftLint. I will put a few references on separate GitHub commits for you to follow along.

To install SwiftLint I will use CocoaPods, so before doing so, I will have to install CocoaPods in the project. 
Let's add the CocoaPods gem in the Gemfile and run `bundle install` on the command line ([GitHub commit](https://github.com/diamantidis/KMP_base/commit/3e1f5fd023317e2f30336136a41b2c68a74ee0eb)).

After this is done, navigate to the `iosApp` directory and run `bundle exec pod init` ([GitHub commit](https://github.com/diamantidis/KMP_base/commit/741fd20af2e79ba5ce3e584d0b18a3520bc98370)).

Then, add `pod 'SwiftLint'` in your `Podfile` and run `bundle exec pod install`([GitHub commit](https://github.com/diamantidis/KMP_base/commit/8e2fc5028e64b09711a94eae85fce4e43986bf72)).

After that, open the `Fastfile` of the iOS project and place the following snippet after the `tests` lane to add a new lane for linting.

```ruby
desc "Run linting"
lane :lint do
swiftlint(
  executable: './Pods/SwiftLint/swiftlint', 
  mode: :lint,
  config_file: '.swiftlint.yml',
)
end
```

Create a new file named `.swiftlint.yml` in the iOS project directory and add the rules based on your needs. An example can be found on my [previous article about SwiftLint]({% post_url 2018-12-23-a-guide-to-swiftlint %}), on my [GitHub project](https://github.com/diamantidis/KMP_base/blob/master/iosApp/.swiftlint.yml) or be simply googling `swiftlint.yml example`.

Finally, you are ready to run `bundle exec fastlane lint` to check if there are any linting issues on the project.

> Here you can find the [GitHub commit](https://github.com/diamantidis/KMP_base/commit/4cbc5bd284395581a6d1a99511a192650a8413ba) with the new lane and the  
`.swiftlint.yml` file.

You can also add one more lane on the `Fastfile` to run the autocorrect functionality of SwiftLint. To do so, add the following snippet on your Fastfile

```ruby
  desc "Run lint autocorrect"
  lane :lint_autocorrect do
    swiftlint(
      mode: :autocorrect,
      executable: './Pods/SwiftLint/swiftlint',
      config_file: '.swiftlint.yml',
    )
  end
```

And you will be able to execute this lane by running the command `bundle exec fastlane lint_autocorrect` on your command line ([GitHub commit](https://github.com/diamantidis/KMP_base/commit/deda4e81872a6c49901acaa8346baff2a8abd585)).

> A practice that I follow is to add some kind of threshold so that I am not forced to fix every warning right here and now. This is available through the `warning_threshold: 20` key that you can add on your `.swiftlint.yml` file.

Having utilized SwiftLint and successfully ran the commands to lint and correct any issues, with the help of fastlane, on the Swift part of the codebase, it's time to move on to the Kotlin part of our project.

## Kotlin code styling

For the Kotlin part of the project, I am going to use [detekt](https://arturbosch.github.io/detekt/index.html), which is a static analysis tool for Kotlin. 

To install `detekt` on our project, first add the following snippet on your `build.gradle`:
```groovy
plugins {
    id "io.gitlab.arturbosch.detekt" version "1.0.0"
}
```

Then we can proceed with the configuration of `detekt` and the rules. Since we may have to use some other tools on our project, let's create a separate directory for the configuration of all these tools, named `tools`. Inside this folder, create two new files, `tools/detekt.gradle` and `tools/detekt.yml`. The first contains the configuration for `detekt`, whilst the second contains the rules that we want to apply to the project.

Put the following snippet on `tools/detekt.gradle`:

```groovy
apply plugin: "io.gitlab.arturbosch.detekt"

detekt {
    toolVersion = "1.0.0"
    input = files("src")
    filters = ".*/resources/.*,.*/build/.*"
    config = files(file("$project.rootDir/tools/detekt.yml"))
}
```

and the following snippet on `tools/detekt.yml`:

```yml
autoCorrect: true

build:
  warningThreshold: 5
  failThreshold: 10
  weights:
    complexity: 2
    formatting: 0
    LongParameterList: 1
    comments: 0.5

style:
  active: true
  WildcardImport:
    active: true
  MaxLineLength:
    active: true
    maxLineLength: 120
    excludePackageStatements: true
    excludeImportStatements: true
    excludeCommentStatements: true
```

> For more info and options about the possible rules, you can refer to the [default detekt config](https://github.com/arturbosch/detekt/blob/master/detekt-cli/src/main/resources/default-detekt-config.yml) or the [official documentation](https://arturbosch.github.io/detekt/configurations.html).


Now we can move to our project and apply detekt. 
Firstly, let's navigate to the `androidApp`, open `build.gradle` and add the following lines:
```groovy
apply from: '../tools/detekt.gradle'
check.dependsOn 'detekt'
```

Then, do the same on the `shared/build.gradle`.

> Here you can find the [GitHub commit](https://github.com/diamantidis/KMP_base/commit/80f463f7b8f568c6a2ecbbefaa003582a2a87cf9) with all the changes done to add and configure detekt.

And that's it. Now you can run `./gradlew clean shared:detekt` and `./gradlew clean androidApp:detekt`. The expected result will be a report of all the issues detected by detekt available on the command line. The report is also generated in html, txt and xml format. 

![detekt report screenshot]({{site.url}}/assets/kmp/detekt_report.png)

Furthermore, by making the `check` gradle task to depend on the `detekt` task, we can also run `./gradlew clean androidApp:check` and `./gradlew clean shared:check` which will execute both the linting and the unit tests.


## Wrap up

We now have our tools for code styling up and running for both the Swift and the Kotlin part of the project!!

To sum up, complying to some code style rules and conventions can be great for a project. Having a tool(or more than one) to do this job is even greater. It will save you from consuming mental power, time and energy to check and apply those rules.

In this post, we have seen how to install, configure and use those tools. I opt to not delve deeper to the rules themselves since I think, according to my experience so far, that this is something totally subjective to each person and team and there should be some thorough thought process before deciding which rules to enable and which not. Contrary, I have focused on how to setup those tools and enable some sample rules so that it is easy for someone to build on top of this implementation. 

A potential next step is to configure some Continuous integration solution to take care of all these commands (and the unit tests as well) every time we check in some code, which is probably something I will cover in one of my next posts. 

Thanks for reading, and should you have any questions or comments, just let me know on [Twitter](https://twitter.com/diamantidis_io) or by [email](mailto:diamantidis@outlook.com)!
