---
layout: post
title: "Kotlin Multiplatform Project: Unit tests for iOS and Android"
description: How to run unit tests for the iOS app, the Android app and the shared library on a Kotlin Multiplatform Project
date: 2019-08-25 08:00 +0200
comments: true
tags: [iOS, Android, KMP, fastlane]
---

In every project, regardless of the language or framework, it's really important to have confidence when making a code change. Unit tests are here for this specific reason. To ensure that the code works as expected, verify that one change doesn't break anything else and to inform you in case that happens.

Since I am still early on my Kotlin Multiplatform Project journey, and as I believe that it is of great benefit and much easier to setup unit tests, lint and CI sooner rather than latter, this post is all about this. Based on the project created on the previous posts ([here]({% post_url 2019-08-04-setup-kotlin-multiplatform-project %}) and [here]({% post_url 2019-08-17-thoughts-on-kotlin-multiplatform-project-structure %})), and which is hosted on [GitHub](https://github.com/diamantidis/KMP_base), I will try to setup and run unit tests for the iOS and the Android app and the shared library as well. 

Let's get started with the iOS app since I am more familiar with this. :smile: 

## iOS Unit tests

There are several ways to run the unit tests for an iOS app. I will focus on those that can be run from a command line, which will later enable me to setup a Continuous Integration solution and run the tests every time I check in some new code.

Long story short, the command to run the unit tests of the iOS app is the following and can be executed from the project root directory.

```
xcodebuild test -project iosApp/iosApp.xcodeproj -scheme iosApp -destination 'platform=iOS Simulator,name=iPhone 7' -derivedDataPath build ONLY_ACTIVE_ARCH=YES

```

Quite verbose, a? There is still an alternative and this is `fastlane`. In case you are not aware of `fastlane`, it is a tool to automate some tasks related with app development and you can find more info [here](https://fastlane.tools/). I will follow the installation process with the Gemfile to add fastlane to this project. The fastlane's documentation about the installation process can be found [here](https://docs.fastlane.tools/getting-started/ios/setup/#use-a-gemfile).

> A commit with all these changes can be found [here](https://github.com/diamantidis/KMP_base/commit/44acdf4ba7a3afce0aacc9cc0e81e7aedfc504c6).

After completing those steps, navigate to the directory `iosApp`, and make sure that the installation is done correctly by running `bundle exec fastlane`. This command will result in a message to setup fastlane since there is no fastlane folder in the project yet. It will look like the following screenshot:

![fastlane setup screenshot]({{site.url}}/assets/kmp/fastlane_setup.png)

You can type `y`, and then, choose the `Manual setup - manually setup your project to automate your tasks` among the option offered. After that, follow the instructions and press `Enter`. A new fastlane folder will be created, containing a Fastfile with a `custom_lane` already there. 

We are ready to replace this `custom lane` with our own lane that will run the unit test. Open `iosApp/fastlane/Fastfile` and replace the whole `:custom_lane` with the following snippet:

```ruby
  desc "Run iOS unit tests"
  lane :tests do
    run_tests(
        project: "iosApp.xcodeproj",
        devices: ["iPhone 7"],
        derived_data_path: "../build"
    )
  end
```

Then, go back to the command line and run the command `bundle exec fastlane tests` to run the unit test. :tada:

> A commit with all these changes can be found [here](https://github.com/diamantidis/KMP_base/commit/81f3578628ccfbdd176c5a98c96db039c6968c94).

> Just to be on the safe side, open `iosAppTests.swift` and make it fail by changing `7` to some other random numbers, and run the `bundle exec fastlane tests` command again to verify that it runs as expected. Don't trust any unit test, if you haven't seen it fail.

## Android app unit tests

As we saw on the iOS app, there are more than one ways to run the unit tests from the command line. The same applies for the Android app too. To start with, use the command line and navigate to the root folder of your project. From there, you can execute the command `./gradlew androidapp:test` to run the unit tests of the android app.

Despite the fact that it's a much shorter command compared to the iOS one, it would be nice to use fastlane to run the unit tests of the Android app too, so that we have familiar setup and commands for both projects.

This time let's follow a different approach to setup fastlane. Navigate to the `androidApp` directory, and just create a folder with the name `fastlane` and place a file named `Fastfile` inside it.

```bash
mkdir fastlane
touch fastlane/Fastfile
```

Open `Fastline` with your favourite editor and, similar to the `Fastfile` of the iOS project, add the following snippet:

```ruby
default_platform(:android)

platform :android do
  desc "Run Android unit tests"
  lane :tests do
    gradle(
      task: "test",
      gradle_path: "../gradlew"
    )
  end
end

```

And you are ready to go back to the command line and execute the same command as for the iOS project (`bundle exec fastlane tests`) to run the unit test for the Android app.
> Again make sure that the command is working as expected on all scenarios, by breaking the test. Changing 4 to 5 on `ExampleUnitTest.kt` is enough. :smiling_imp:

> A commit with all these changes can be found [here](https://github.com/diamantidis/KMP_base/commit/fc656dd09c7141f5a3309c57966811deac416a32).

# Shared Library

At this point, we have the scripts to run the unit tests for the iOS and the Android app, so it's time to move on to the shared library. Sadly, we cannot use fastlane, and thus we are going to use `gradle`. The simple command to run the tests is the following:
`./gradlew clean shared:test`. It seems that `gradle` doesn't print a detailed output of the results of the tests, but rather a generic status of `BUILD SUCCESSFUL in Xs` in case of success.


As we did before, let's try to break the tests one by one. First, open `SampleTests.kt` and replace `assertTrue(Sample().checkMe() > 0)` with `assertTrue(Sample().checkMe() > 100)`, and rerun `./gradlew clean shared:test`. In this case, when an error occurs, the output is much more detailed like: 
```
sample.SampleTests > testMe FAILED
    java.lang.AssertionError at SampleTests.kt:10

3 tests completed, 1 failed
```

Though it seems a little weird to output that 3 tests are completed and not 4 since there are 2 tests on the `commonTest` directory and 1 for each of `iosTest` and `androidTest`. 

But let's carry on, revert the change on `SampleTests.kt` and try to break the test on `SampleTestsAndroid.kt` too, by replacing the literal `Android` with something else.

Again, it seems to work:
```
sample.SampleTestsAndroid > testHello FAILED
    java.lang.AssertionError at SampleTestsAndroid.kt:9

3 tests completed, 1 failed
```

Similarly, revert `SampleTestsAndroid.kt` and try to make the test on `SampleTestsIOS.kt` fail. Same as the Android test, replacing the literal `iOS` with something else is enough to make the test and therefore the command fail.

But it doesn't :thinking:.

The tests for iOS are not executed and this is happening because Kotlin Multiplatform Project plugin doesn't support running tests on other than the host platforms, e.g iOS on macOS. To solve this issue we have to manually add a new Gradle task to run those iOS tests. This task will spawn a simulator process where the tests will be run.

The following snippet contains this task and it should be added in the `shared/build.gradle`.

```groovy
task iosTest {
    def device = project.findProperty("iosDevice")?.toString() ?: "iPhone X"
    dependsOn kotlin.targets.ios.binaries.getTest('DEBUG').linkTaskName
    group = JavaBasePlugin.VERIFICATION_GROUP
    description = "Runs iOS tests on a simulator"

    doLast {
        def binary = kotlin.targets.ios.binaries.getTest('DEBUG').outputFile
        exec {
            commandLine 'xcrun', 'simctl', 'spawn', device, binary.absolutePath
        }
    }
}
```

You can run this task by navigating to the project root directory and either executing the command `./gradlew clean shared:iosTest` or `./gradlew clean shared:iosTest -PiosDevice="iPhone 8"` to run on a different simulator.

Running those commands now will result in an error since we have changed `SampleTestsIOS.kt`. If we rollback to the `iOS` literal, both of these commands will finish with success.

Furthermore, we can add the following snippet in the end of the `shared/build.gradle` too: `tasks.check.dependsOn iosTest`. This will enable us to execute `./gradlew clean shared:check` and run all the tests. This can be potentially useful when we make changes on every project of the shared library and we want to run all the tests with one command.
 
> A commit with all these changes can be found [here](https://github.com/diamantidis/KMP_base/commit/25b7a226dd147f9f72d69d62ac0a477c67c7e3fc).

## Conclusion

In this post, we have seen how to setup fastlane on both iOS and Android apps and what are the commands to run the test for each project individually. Now, every time we make a code change, we can run one of those commands to make sure that we haven't break anything. Of course, unit tests and knowing how to run them is important but making sure that they are kept updated and that they run frequently and on every change is equally important to get the most out of them. Setting up Continuous integration and code coverage are some steps towards that direction but those are big topics on their own that I will probably cover in one of the next posts. Until then, have fun and do let me know if you have any questions!!

