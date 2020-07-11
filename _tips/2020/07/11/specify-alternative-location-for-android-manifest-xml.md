---
layout: tips
title: How to specify an alternative location for the AndroidManifest.xml
description: A guide on how to set Gradle to use a different location for the AndroidManifest.xml
date: 2020-07-11 06:00 +0200
tags: ["Android"]
image:
    path: /assets/social/tips/android_manifest_alternative_location.png
    width: 680
    height: 336
twitter:
    card: summary_large_image
---

By default, `Gradle` expects an `AndroidManifest.xml` file on the root directory of the `main` source set of every Android project. But what if for some reason we want to change this?


For me, one such case is the default `Kotlin Native` project. When creating a new project, the template creates a few source sets for the `common`, the `iOS`, and the `Android` implementation. For the common and the iOS source sets, it uses names like `commonMain` and `iOSMain`. But when it comes to the Android source set, the name is not the expected `androidMain` but rather a plain `main`.

As I wanted to keep a consistent and more clear naming for the source sets, I decided to rename the name of the folder `main` to `androidMain`. And that's when the problem appeared. When I tried to build the app, I got an error saying `"Cannot read packageName from src/main/AndroidManifest.xml"`.


The good news are that we have the option to change this location on the `build.gradle`!


Inside the `android` block, we can set `manifest.srcFile` to the new location of the `AndroidManifest.xml`.

```gradle
sourceSets {
    main {
        manifest.srcFile 'src/androidMain/AndroidManifest.xml'
        java.srcDirs = ['src/androidMain/java']
        res.srcDirs = ['src/androidMain/res']
    }
}
```

And voilà!!
Gradle uses the `AndroidManifest.xml` inside the `androidMain` folder and we are now able to build and run the app again!
