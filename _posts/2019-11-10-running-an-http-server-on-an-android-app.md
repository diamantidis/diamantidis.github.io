---
layout: post
title: Running an HTTP server on an Android app
description: A post on how to use Ktor to run an HTTP server from an Android app
date: 2019-11-10 06:00 +0200
comments: true
tags: [Kotlin, Ktor, Android]
---

A few days ago I wrote [a post describing how to run an HTTP server from an iOS app]({%post_url 2019-10-27-swift-nio-server-in-an-ios-app %}).
This intrigued me to start investigating how to implement a similar application on an Android app too. So, in this post I will describe how to setup and run an HTTP server from an Android app. 

As I mentioned in the iOS post, such a setup (running a server from an app) can be utilized in many ways, with performing usability testing being one of those. If the app under test depends on a backend service, then we could apply some configuration to target the app with the server, which in turn would act as a mock server.

But enough with the intro, let's move to the action.

## Implementation

# Ktor

For the purposes of this app I am going to use [Ktor framework](https://github.com/ktorio/ktor) to run the server. Ktor is a framework that helps implementing web-based applications and it can be used either on an Android app for the client-side logic or on a Kotlin server-side project. There is also [support for Kotlin Multiplatform Projects](https://ktor.io/clients/http-client/multiplatform.html) which enables you to write the networking client code once in Kotlin and then compile to whatever platform you are interested in, for example iOS.

> If are interested in that and you want to learn more, you can check out my [previous post about how to create a Feed reader app with Kotlin Native]({%post_url 2019-10-13-json-feed-reader-app-with-kotlin-native %}).

Sadly, Ktor Server is not currently [supported](https://github.com/ktorio/ktor/issues/571) but hopefully it will be sooner or later. 

# Dependencies

On a vanilla Android project, let's add the dependencies on the `app/build.gradle` file: 

```groovy
implementation "io.ktor:ktor:1.2.5"
implementation "io.ktor:ktor-server-netty:1.2.5"
implementation "io.ktor:ktor-gson:1.2.5"
```

We also have to add the following `packagingOptions` to avoid any build conflicts

```groovy
    packagingOptions {
        exclude 'META-INF/*'
    }
```

The final `app/build.gradle` should look like the following:

```groovy
apply plugin: 'com.android.application'
apply plugin: 'kotlin-android'
apply plugin: 'kotlin-android-extensions'

android {
    compileSdkVersion 28
    defaultConfig {
        applicationId "io.github.diamantidis.androidServer"
        minSdkVersion 28
        targetSdkVersion 28
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    packagingOptions {
        exclude 'META-INF/*'
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation"org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version"
    implementation 'androidx.appcompat:appcompat:1.1.0'
    implementation 'androidx.core:core-ktx:1.1.0'
    implementation 'androidx.constraintlayout:constraintlayout:1.1.3'
    testImplementation 'junit:junit:4.12'
    androidTestImplementation 'androidx.test:runner:1.2.0'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.2.0'

    implementation "io.ktor:ktor:1.2.5"
    implementation "io.ktor:ktor-server-netty:1.2.5"
    implementation "io.ktor:ktor-gson:1.2.5"
}
```

# Permissions

The next step is to add an entry on the `AndroidManifest.xml` regarding the `INTERNET` permissions like in the following snippet:


```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="io.github.diamantidis.androidServer">
    <uses-permission android:name="android.permission.INTERNET"/>

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity android:name=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

# Code

Finally, we can open our `MainActivity.kt` and add the following content:

```kotlin
package <your_package>

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.features.ContentNegotiation
import io.ktor.gson.gson
import io.ktor.response.respond
import io.ktor.routing.get
import io.ktor.routing.routing
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        embeddedServer(Netty, 8080) {
            install(ContentNegotiation) {
                gson {}
            }
            routing {
                get("/") {
                    call.respond(mapOf("message" to "Hello world"))
                }
            }
        }.start(wait = true)
    }
}

```


We first create a server with `Netty` as the application engine, `8080` as the port and a module function. Inside this module function, we add the `ContentNegotiation` feature and register the `gson` converter. This will allow us to convert the request data to our model and our models to JSON responses.
After that, we use the `routing` feature to define our endpoint and the response. The current implementation returns just a simple map, but it could also return a more complex data structure. Finally we start the server and we explicitly set to wait until we stop it. 

We are now ready to run the app. After the app is successfully installed and running on either a device or a simulator, open the browser and hit `localhost:8080`.

Voilà! You should get `{"message": "Hello world"}` as a response!

## Conclusion

To sum up, in this post we have seen how to run a simple HTTP server from an Android app using Ktor Server. In just 10 lines of code, we manage to create, set up and run an HTTP server. And with the JSON serialization installed. 

Thanks for reading and should you have any questions, suggestions or comments, just let me know on [Twitter](https://twitter.com/diamantidis_io) or [email me](mailto:diamantidis@outlook.com)!!
