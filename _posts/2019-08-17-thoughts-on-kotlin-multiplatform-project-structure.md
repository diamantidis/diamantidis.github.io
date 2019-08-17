---
layout: post
title: Thoughts on Kotlin Multiplatform Project structure
description: My thoughts on the current structure of an Android/iOS project built with Kotlin Multiplatform Project and some considerations for potential improvements
date: 2019-08-17 08:00 +0200
comments: true
tags: [iOS, Xcode, Android, Kotlin, KMP]
---

In the [previous article]({% post_url 2019-08-04-setup-kotlin-multiplatform-project %}), I tried to explain step by step the process of creating an iOS and Android app with a shared library using Kotlin Multiplatform Project.
Having our project ready and running on both Android and iOS, it's time to investigate how the project is structured.
So, the topic of this post will revolve around the folder structure of the created project, and I will share some of my thoughts about potential improvements.

## Project Folder Structure
The file tree of the current project looks like this. (some directories, like the `build` are omitted for brevity)
```
.
├── app
│   ├── Info.plist
│   ├── build
│   │   ├── ...
│   │   └── ...
│   ├── build.gradle
│   └── src
│       ├── commonMain
│       │   ├── kotlin
│       │   │   └── sample
│       │   │       └── Sample.kt
│       │   └── resources
│       ├── commonTest
│       │   ├── kotlin
│       │   │   └── sample
│       │   │       └── SampleTests.kt
│       │   └── resources
│       ├── iosMain
│       │   ├── kotlin
│       │   │   └── sample
│       │   │       └── SampleIos.kt
│       │   └── resources
│       ├── iosTest
│       │   ├── kotlin
│       │   │   └── sample
│       │   │       └── SampleTestsIOS.kt
│       │   └── resources
│       ├── main
│       │   ├── AndroidManifest.xml
│       │   ├── java
│       │   │   └── sample
│       │   │       └── SampleAndroid.kt
│       │   ├── kotlin
│       │   └── res
│       │       ├── layout
│       │       │   └── activity_main.xml
│       │       └── values
│       │           ├── strings.xml
│       │           └── styles.xml
│       └── test
│           ├── java
│           │   └── sample
│           │       └── SampleTestsAndroid.kt
│           └── kotlin
├── build
│   └── kotlin
│       └── sessions
├── build.gradle
├── gradle
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradle.properties
├── gradlew
├── gradlew.bat
├── iosApp
│   ├── iosApp
│   │   ├── AppDelegate.swift
│   │   ├── Base.lproj
│   │   │   ├── LaunchScreen.storyboard
│   │   │   └── Main.storyboard
│   │   ├── Info.plist
│   │   └── ViewController.swift
│   ├── iosApp.xcodeproj
│   └── iosAppTests
│       ├── Info.plist
│       └── iosAppTests.swift
├── local.properties
└── settings.gradle
```

The main points of interest are two directories. 
The first one is the `iosApp` folder which contains the whole iOS app.
The second one is the `app` folder which contains the shared library and the Android app. 
The shared logic resides under the `commonMain` folder and `commonTest` is the place for the tests of the shared library. 
`iOSMain` is the place for the iOS specific logic and `iOSTest` is the place for the tests of the iOS logic.
Lastly, `main` is used both for the JVM-specific logic of the shared library and the Android app as well. For instance, `SampleAndroid.kt` contains both the JVM-specific code and the MainActivity of the android app. 

```kotlin
actual class Sample {
    actual fun checkMe() = 44
}

actual object Platform {
    actual val name: String = "Android"
}

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Sample().checkMe()
        setContentView(R.layout.activity_main)
        findViewById<TextView>(R.id.main_text).text = hello()
    }
}
```

## Thoughts :thinking:

Having the shared library logic mixed with the Android app can be a potential source of issues. Ideally I would like to keep it separate and have the shared library as a dependency on the Android app, just like the iOS app. Long story short, let's create a new app and migrate all the android app logic out of the `app` directory.

## Creating a new Android App

Open the project with Android Studio and follow the steps below to create a new Android app inside the current project:

1. Right click on the project folder and then choose the option New > Module.
2. Choose `Phone & Tablet Module` from the popup and press Next.
3. Configure the app by naming it as `androidApp`, change the package name if you would like to and set the minimum sdk version, Then, press Next.
4. Choose the option `Empty Activity` and press Next.
5. Name the activity `MainActivity` and keep the option to `Generate the layout file`, the name of the layout file as `activity_main` and the source language as Kotlin. After that, click on the `Finish` button.

The new app is created and Gradle will try to sync and build the project, but it will end up showing an error with a message `Plugin request for plugin already on the classpath must not include a version`.
To fix this error, let's go to `app/build.gradle` and remove the version from the line `id 'org.jetbrains.kotlin.multiplatform' version '1.3.41'`

Next, let's move all the repositories to the root `build.gradle`, by adding the following snippet instead of the `repositories` block to the `build.gradle` on the root folder and in parallel removing the `repositories` block from the `app/build.gradle`
```groovy
allprojects {
    repositories {
        google()
        jcenter()
        mavenCentral()
    }
}
``` 

And, by the way, though it's done automatically when creating the app, make sure to include `androidApp` into `settings.gradle`.

Congrats, we are now able to run the app! At last we have the default "Hello World!!" on an Android app. 

> A commit with all these changes can be found [here](https://github.com/diamantidis/KMP_base/commit/edf9d0ddfaf8a8433b28865ad9197ecd9fd66345)
 
## Migrate Android app from shared library to androidApp

The next step is to migrate the code related to the android app from the shared module to the `androidApp`.

First, go to `androidApp/build.gradle` and add the dependency to the shared library by adding `implementation project(':app')` inside the dependencies block so that we can use the shared project from within the app.

This will make Gradle fail with message something like 
```
Unable to resolve dependency for ':androidApp@debug/compileClasspath': Could not resolve project :app.
```

 In order to fix this, let's go to the `app/build.gradle` and replace the line `apply plugin: 'com.android.application'` with `apply plugin: 'com.android.library'` since there will be no application inside the `app` package. Also, remove the line with `applicationId` from the `android` block.

Then copy `activity_main.xml` from `app/src/main/res/layout/` to `androidApp/src/main/res/layout/` and the `MainActivity` class from `SampleAndroid.kt` to `MainActivity.kt`.
 
These are all the changes needed and if you run the app, you should be able to see the "Hello from Android" message.

> A commit with all these changes can be found [here](https://github.com/diamantidis/KMP_base/commit/2428ad7caa624ed32e52b6e6a1729330e1af7810)

## Cleaning up shared library

But we are not done yet. Some cleanup is required in the shared library to remove all the Android app related code.

Let's start from `SampleAndroid.kt`, where we can remove the whole `MainActivity` class and the related unused imports as well. Furthermore, `app/src/main/res/` is unused so the entire directory can be safely removed. Moving on to the `app/src/main/AndroidManifest.xml`, we can remove the `<application>` block since there is no application any longer in this project. Finally, `app/build.gradle` also needs some cleaning since we can remove the whole `dependencies` block and other android-specific configurations like the whole `android.defaultConfig` block.

Phew, the shared library no longer has any Android-app related code! :sweat_smile:

> A commit with all these changes can be found [here](https://github.com/diamantidis/KMP_base/commit/39d537cf80b20b80f911d2d069231559277c4980)

Now, take a look at the common and iOS part. As you can notice, they follow the same naming and folder conventions. Both are structured in a `<platform>Main` and a `<platform>Test` folder both containing a `kotlin` folder.

I would like to change the android part of the shared library to also adhere to these conventions. 
Therefore, I will move the sample package from the `java` folder to the `kotlin` folder and then rename the `main` and the `test` to `androidMain` and `androidTest` respectively. 

We are going to still need the `main` package for the `AndroidManifest.xml` since this is the default location gradle is looking for it. Otherwise, we will get an error with a message something like:
```
ERROR: Cannot read packageName from <project_location>/app/src/main/AndroidManifest.xml
```
So, we have to create again a directory named `main` inside the `app/src` folder and then move `AndroidManifest.xml` there.

Lastly, we can remove the `resources` folder from `commonMain`, `commonTest`, `iosMain` and `iosTest` folders since we are not going to need it for now.

After all this changes, the folder structure of the shared library would be like the following:
```
app/src
├── androidMain
│   └── kotlin
│       └── sample
│           └── SampleAndroid.kt
├── androidTest
│   └── kotlin
│       └── sample
│           └── SampleTestsAndroid.kt
├── commonMain
│   └── kotlin
│       └── sample
│           └── Sample.kt
├── commonTest
│   └── kotlin
│       └── sample
│           └── SampleTests.kt
├── iosMain
│   └── kotlin
│       └── sample
│           └── SampleIos.kt
├── iosTest
│   └── kotlin
│       └── sample
│           └── SampleTestsIOS.kt
└── main
    └── AndroidManifest.xml
```

> A commit with all these changes can be found [here](https://github.com/diamantidis/KMP_base/commit/68a281ed4f20574ad4a4d34f2eb167302a2c364f)
 
## Rename app to shared

There is still one change that I would like to make. This would be to change the `app` to something like `shared` to better illustrate what it actually is.

Let's try to see the steps needed to do so.

First and foremost, let's make use of Android Studio's refactor utility and rename the whole module `app` to `shared`. As expected, Android Studio will make all the required changes and the `androidApp` will work without any further changes. 

> A commit with all these changes can be found [here](https://github.com/diamantidis/KMP_base/commit/dd493891c05c64b37bf4ccb978dfd4104b85692f)

But this is not the case for the iOS app too. :disappointed:

First we will get the error `error: Build input file cannot be found: '<project_dir>/app/Info.plist'` when we try to run the app.

On Android Studio, open `project.pbxproj`, search for `/app/Info.plist` and change it to `/shared/Info.plist`.

That change will fix this issue, but another one pops up with a message that contains something like:
```
 What went wrong:
The specified project directory '<project_dir>/app' does not exist.
```

This comes from the custom build script that builds the shared framework. Again, open `project.pbxproj`, search for `PBXShellScriptBuildPhase` and inside this section replace the occurrence of `/app` with `/shared`.

After cleaning and building the app again, we now get an error on `ViewController.swift` saying that `No such module 'app'`.

In order to fix that, let's go to our `shared/build.gradle` and scroll to the bottom where we declare the iOS framework. It's still `app`. So, let's change that to `shared` and change `ViewController.swift` to `import shared`.

Going back to Xcode to build the app, we are now getting this `ld: framework not found app` error! :tired_face:

Let's open `project.pbxproj` on Android Studio again, and this time search for`app.framework` and replace all the occurrences with `shared.framework`.

Next, search for `app` with the `words` options on, to find those that are only app and not for example `AppDelegate`. Sadly, a few other cases will by matched, like `iosApp.app` or `com.example.app`, so changing `app` to `shared` have to be done one by one.

And..., that's it, you can now run your app in both iOS and Android! :tada:

> A commit with all these changes can be found [here](https://github.com/diamantidis/KMP_base/commit/5bb82c759fbf9bdca45034994f3bbf60ec379ba1)
 
## Conclusion

The project, now, has a folder structure that keeps both the iOS and the Android app separated from the shared logic and also the package that contains the shared logic is finally named shared.

Since I am still doing my first baby steps on Kotlin Multiplatform Project, I may have to make some adaptations to this structure as I learn more, but for now, I believe that these changes on the current project will help me it the long run.
Having said that and with a folder structure that I believe that it seems to be more suitable, I will continue my exploration on Kotlin Multiplatform Project with a post on setting up and running unit tests for the apps and the shared library and how to built a CI solution for this project. 
I hope that you find this post useful and let me know if you have any questions! See you soon!

