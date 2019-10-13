---
layout: post
title: JSON feed reader app with Kotlin Native
description: A post describing how to create a JSON feed reader library with Kotlin Native and how to later use it from an iOS and an Android app
date: 2019-10-13 06:00 +0200
comments: true
tags: ["JSON feed", Kotlin, KN]
---

Having spent some time exploring and learning more about Kotlin Native, time has come to start building an app where I can use Kotlin Native in a real world use case. After a lot of ideas, I finally decided to build a feed reader app for this blog. 

It seems that such an app would be an ideal first project as I will have the opportunity to explore features like networking, de-serializing, storing user preference and much more that I will find out as I move on. At the same time, it doesn't sound too demanding both in respect of time and effort. 

For the sake of this app, I will use the [JSON feed](https://jsonfeed.org/) that I added on my Jekyll site, the process of which is documented on [another post]({%post_url 2019-10-05-json-feed-for-jekyll-sites %}).

Furthermore, I will use [a template](https://gitlab.com/diamantidis_io/kmp_template) that I have built as a base for any Kotlin Native project, and which already includes the required setup for unit tests, linting and CI. The whole process of how I created this template has been recorded in [a series of posts]({{"tags#KMP" | absolute_url }}).

So, are you ready to move on the implementation? Let's go!

## Implementation

First thing first, let's start with the dependencies.

The feed reader will have to make an HTTP request to fetch the feed and then to transform the JSON response to a Kotlin object. To implement those tasks, we are going to use [coroutines](https://kotlinlang.org/docs/reference/coroutines-overview.html), [ktor](https://ktor.io/) and the [kotlinx serialization](https://github.com/Kotlin/kotlinx.serialization).


To begin with, let's define the version of the dependencies on the `gradle.properties` file, like below:

```groovy
coroutines_version=1.2.2
serialization_version=0.11.1
ktor_version=1.2.4
```

Next, we will have to edit `build.gradle` and add the following line on the `dependencies` block:

```groovy
    classpath "org.jetbrains.kotlin:kotlin-serialization:$kotlin_version"
```

After this, we can move to the `shared/build.gradle` file.

First we have to add the following line to apply the kotlinx-serialization: 
```groovy
apply plugin: 'kotlinx-serialization'
```

 and then we can define our dependencies for each target like in the following snippet:

```groovy
        commonMain {
            dependencies {
                implementation kotlin('stdlib-common')
                implementation "org.jetbrains.kotlinx:kotlinx-coroutines-core-common:$coroutines_version"
                implementation "org.jetbrains.kotlinx:kotlinx-serialization-runtime-common:$serialization_version"

                implementation "io.ktor:ktor-client-core:$ktor_version"
                implementation "io.ktor:ktor-client-serialization:$ktor_version"
            }
        }
        commonTest {
            dependencies {
                implementation kotlin('test-common')
                implementation kotlin('test-annotations-common')
            }
        }
        androidMain {
            dependencies {
                implementation kotlin('stdlib')
                implementation "org.jetbrains.kotlinx:kotlinx-coroutines-core-common:$coroutines_version"
                implementation "org.jetbrains.kotlinx:kotlinx-serialization-runtime:$serialization_version"

                implementation "io.ktor:ktor-client-core-jvm:$ktor_version"
                implementation "io.ktor:ktor-client-serialization-jvm:$ktor_version"

                implementation "io.ktor:ktor-client-okhttp:$ktor_version"
            }
        }
        androidTest {
            dependencies {
                implementation kotlin('test')
                implementation kotlin('test-junit')
            }
        }
        iosMain {
            dependencies {
                implementation "org.jetbrains.kotlinx:kotlinx-coroutines-core-native:$coroutines_version"
                implementation "org.jetbrains.kotlinx:kotlinx-serialization-runtime-native:$serialization_version"

                implementation "io.ktor:ktor-client-ios:$ktor_version"
                implementation "io.ktor:ktor-client-core-native:$ktor_version"
                implementation "io.ktor:ktor-client-serialization-native:$ktor_version"
            }
        }
        iosTest {
        }
```

Lastly, we have to add [another line](https://kotlinlang.org/docs/reference/building-mpp-with-gradle.html#experimental-metadata-publishing-mode) on the `settings.gradle` for the coroutines:

```groovy
enableFeaturePreview("GRADLE_METADATA")
``` 

> All these changes can be found on [this GitHub commit](https://github.com/diamantidis/BlogApp/commit/6b4f4c3d2ac7042eb9aeef8d739f741651c24570).


Having all the dependencies in place, we are ready to move on to the actual library.

Let's navigate to the `common` module inside the `shared` folder. There, we will create a package, which will host our feed reader. In my case the package name is `io.github.diamantidis.feedreader` and that will be the working directory for the rest of the post. 

### Models

Inside this package folder we will create a new directory named `model`, where we will place the models that will be used to map the JSON feed to a Kotlin object. 

Based on the [JSON feed file]({{ "feed.json" | absolute_url }}) we are going to need three classes, so let's create three files inside the `model` directory: `Author.kt`, `Feed.kt` and `Item.kt` and add the following snippets respectively.


```kotlin
// model/Author.kt
package io.github.diamantidis.feedreader.model

import kotlinx.serialization.Serializable

@Serializable
data class Author (
    val name: String,
    val url: String
)
```

```kotlin
// model/Feed.kt
package io.github.diamantidis.feedreader.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Feed (
    val version: String,
    val title: String,
    @SerialName("home_page_url")
    val homePageURL: String,
    @SerialName("feed_url")
    var feedURL: String,
    val description: String,
    val icon: String? = null,
    val favicon: String? = null,
    var expired: Boolean? = null,
    val author: Author,
    val items: List<Item>
)
```

```kotlin
// model/Item.kt
package io.github.diamantidis.feedreader.model

import io.ktor.util.date.GMTDate
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient
import io.github.diamantidis.feedreader.utils.parseDate

@Serializable
data class Item (
    val id: String,
    val url: String,
    val title: String,
    @SerialName("date_published")
    val datePublishedStr: String? = null,
    @SerialName("date_modified")
    val dateModifiedStr: String? = null,
    val author: Author? = null,
    val summary: String? = null,
    @SerialName("content_html")
    val contentHtml: String? = null
) {
    @Transient
    val datePublished: GMTDate?
        get() = datePublishedStr?.parseDate()
    @Transient
    val dateModified: GMTDate?
        get() = dateModifiedStr?.parseDate()
}
```
As you can see from these snippets, we are using the `kotlinx.serialization` and the `@Serializable` and `@SerialName` annotations for the de-serialization. 
Some properties are declared optional, as they may not be on the response we are going to get from the feed. Furthermore, we make use of the `@Transient` annotation alongside a helper function named `parseDate()` and ktor's `GMTDate` to get a date representation of the dates which are plain string properties on the JSON feed.

For this helper function, and for any potential likewise functionality, I have created another folder named `utils`. Inside this directory a file named `DateFormatter.kt` is added with the following content:

```kotlin
package io.github.diamantidis.feedreader.utils

import io.ktor.util.date.GMTDate
import io.ktor.util.date.Month

internal fun String.parseDate(): GMTDate {
    val dateRegex = "^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\\\.[0-9]+)?(Z)?".toRegex()

    val matchResult = dateRegex.find(this)

    matchResult?.groupValues?.let {
        val year = it.get(1).toInt()
        val month = it[2].toInt()
        val day = it[3].toInt()
        val hour = it[4].toInt()
        val minute = it[5].toInt()
        val second = it[6].toInt()

        return GMTDate(second, minute, hour, day, Month.from(month - 1), year)
    } ?: run {
        throw Error("Error while parsing $this")
    }
}
```

The helper function makes use of a regex to parse each component of a date field and then create an instance of `GMTDate`.

> All these changes can be found on [this GitHub commit](https://github.com/diamantidis/BlogApp/commit/539a2b0350825c740a7193386179f2b8841b9055).

And that's it with the model layer. We can now move on to the `Ktor` implementation which will be responsible for the network request and the de-serialization of the response.

### Networking

For the network we are going to create another package named `network` and inside it we are going add a new file named `Api.kt`. This file will have the following content:

```kotlin
package io.github.diamantidis.feedreader.network

import io.ktor.client.HttpClient
import io.ktor.client.features.json.JsonFeature
import io.ktor.client.features.json.serializer.KotlinxSerializer
import io.ktor.client.request.HttpRequestBuilder
import io.ktor.client.request.get
import io.ktor.http.takeFrom
import kotlinx.serialization.json.Json
import io.github.diamantidis.feedreader.model.Feed

class Api {
    private val client: HttpClient = HttpClient {
        install(JsonFeature) {
            serializer = KotlinxSerializer(Json.nonstrict).apply {
                setMapper(Feed::class, Feed.serializer())
            }
        }
    }

    private fun HttpRequestBuilder.apiUrl(path: String) {
        url {
            takeFrom("https://diamantidis.github.io/")
            encodedPath = path
        }
    }

    suspend fun fetchFeed(): Feed = client.get {
        apiUrl("feed.json")
    }
}
```

First we create the HttpClient and define the serializer that will transform the JSON response to a Kotlin object. Then, we define a helper function to construct the URL and lastly we define the coroutine function that will make the request and return an object of the class `Feed` that we have previously mentioned.

> All these changes can be found on [this GitHub commit](https://github.com/diamantidis/BlogApp/commit/fcb5dc3237a1fe7de82a397c8569069a2c589d9f).

### Coroutines

As we said before, for our network processes, we are going to make use of `coroutines`.

Generally it's a good practice to not use the `GlobalScope` but rather provide a custom instance of `CoroutineScope`. 
Since we are working on objects with a lifecycle, we should cancel all the operation related to these objects, when they are destroyed.

Using `GlobalScope` we have to do this manual for each operation, whereas with the use of an instance of `CoroutineScope` we can cancel all the operations of this scope by calling the function `cancel`. For more info you can refer to [Coroutine's documentation](https://kotlinlang.org/docs/reference/coroutines/coroutine-context-and-dispatchers.html#coroutine-scope).

To define a custom `CoroutineScope` provider, let's create a file named `common.kt` and we add the following content:

```kotlin
package io.github.diamantidis.feedreader

import kotlinx.coroutines.CoroutineScope

internal expect fun ApplicationScope(): CoroutineScope
```


Basically, with this snippet, we are stating that we expect for a native implementation of a `CoroutineScope` provider function from both the iOS and Android module.

So, on the Android module, we are going to add an `ApplicationScope.kt` file containing the following snippet where we provide the actual implementation:

```kotlin
package io.github.diamantidis.feedreader

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.MainScope

internal actual fun ApplicationScope(): CoroutineScope = MainScope()
```

Contrary to the Android implementation, on the iOS module, we have a little more work to do. We have to create our own dispatcher, since iOS doesn't provide a default one like Android.

Currently there is a known open issue regarding support for [multi-threaded coroutines on Kotlin/Native](https://github.com/Kotlin/kotlinx.coroutines/issues/462) and for this reason our custom dispatcher will use Grand Central Dispatch to run the asynchronous code on the main thread. 

For this implementation, we are going to create a new file named `ApplicationScope.kt` inside the iOS module and place the following code in it:

```kotlin
package io.github.diamantidis.feedreader

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Runnable
import platform.darwin.dispatch_async
import platform.darwin.dispatch_get_main_queue
import platform.darwin.dispatch_queue_t
import kotlin.coroutines.CoroutineContext
import kotlin.native.concurrent.freeze

internal actual fun ApplicationScope(): CoroutineScope = CoroutineScope(MainDispatcher(dispatch_get_main_queue()))

internal class MainDispatcher(private val dispatchQueue: dispatch_queue_t) : CoroutineDispatcher() {
    override fun dispatch(context: CoroutineContext, block: Runnable) {
        dispatch_async(dispatchQueue.freeze()) {
            block.run()
        }
    }
}
```

> All these changes can be found on [this GitHub commit](https://github.com/diamantidis/BlogApp/commit/a63b4c3e75440fb6080c3e7dfbb3539e61f975a2).

Now, that we are done with the model, the network and the coroutines, let's take some time to focus on the presentation.

### Presentation

 For the presentation logic, we are going to create yet another folder named `presentation`. Since we have to perform a network request, every view that is going to fetch this feed will have to handle three states: Loading the data, a potential error and of course the successful scenario, in which case the feed info is fetched.

To cater for all these scenarios we are going to define an interface that our native views will have to implement. For this reason, let's create a file named `FeedView.kt` and add the following as a content: 
 
```kotlin
package io.github.diamantidis.feedreader.presentation

import io.github.diamantidis.feedreader.model.Feed

interface FeedView {
    fun showData(feed: Feed)
    fun showError(error: Throwable)
    fun showLoading()
}
```

We simply declare the three functions that we are going to call depending on the state of the request.

> All these changes can be found on [this GitHub commit](https://github.com/diamantidis/BlogApp/commit/b9ffc627d1893401b14b767711f2858a55db919e).

And now it's time to connect all these pieces together. We are following the MVP pattern, so we will define a presenter that will interact with the view both to fetch the data and to update the UI depending on the response of the network request.

### Presenter

Let's create a new folder named `presenter` and a new file named `FeedPresenter.kt`. Next, add the following snippet in this file.

```kotlin
package io.github.diamantidis.feedreader.presenter

import kotlinx.coroutines.*
import io.github.diamantidis.feedreader.ApplicationScope
import io.github.diamantidis.feedreader.model.Feed
import io.github.diamantidis.feedreader.network.Api
import io.github.diamantidis.feedreader.presentation.FeedView

class FeedPresenter(
    private val view: FeedView,
    private val api: Api = Api(),
    private val mainScope: CoroutineScope = ApplicationScope()
) {
    fun loadData() {
        view.showLoading()

        mainScope.launch {
            try {
                val result: Feed = api.fetchFeed()
                view.showData(result)
            } catch (error: Throwable) {
                view.showError(error)
            }
        }
    }

    fun destroy() = mainScope.cancel()
}
```

In this class we inject the view that will present the data, using the interface we created earlier. We also inject the dependencies like the `CoroutineScope` and the `Api`, providing some default values. 

For now, the main functionalities of this class are just two. One to initialize the process of fetching the feed and one for cancelling any pending process. The first function, `loadData`, is responsible for triggering the network request and notifying the view about the state changes by calling the corresponding function declared in the `FeedView` interface.

The `destroy` function will be called to terminate all the operations on the injected scope when the caller object is going to be destroyed.

> All these changes can be found on [this GitHub commit](https://github.com/diamantidis/BlogApp/commit/1a61e0ccc8f0c3583b813dd7ea1d53b77d484e44).

With the above implementation of `FeedPresenter` we should be done and ready to use our library from an iOS or Android app. Though on Android it is possible to create a new instance of the presenter by just calling `private val presenter: FeedPresenter by lazy { FeedPresenter(this) }` from an activity that implements the `FeedView` interface, on iOS is not so easy. Default constructors are not working as expected, so we have to instantiate a new instance of `Api` and `CoroutineScope`. Using a factory class would be a good alternative.

## Factory

For this reason, let's create a new directory named `factory` and place a file named `PresenterFactory.kt` inside it. Then, we put the following snippet as content to this file:

```kotlin
package io.github.diamantidis.feedreader.factory

import io.github.diamantidis.feedreader.presentation.FeedView
import io.github.diamantidis.feedreader.presenter.FeedPresenter

class PresenterFactory {
    companion object {
        fun createFeedPresenter(view: FeedView) = FeedPresenter(view)
    }
}
```

In this file, we just declare a method on the companion object to instantiate the Presenter.

Then we can use this class to create our presenter on both iOS and Android, like in the following snippets:

```kotlin
// Android
private val presenter: FeedPresenter by lazy { PresenterFactory.createFeedPresenter(this) }
```

```swift
// iOS
private lazy var presenter = PresenterFactory.Companion().createFeedPresenter(view: self)
```

> All these changes can be found on [this GitHub commit](https://github.com/diamantidis/BlogApp/commit/cc5f4c3adb70ac6e4e43141e459cd308e88724cf).

Now, our JSON feed reader library is ready to be used on the apps. Let's see how!

## Android app

For the Android app we have to implement the `FeedView` interface on our `MainActivity`, lazy initialize the `FeedPresenter` and then by calling the function `loadData` to fetch the feed. We then make use of an `ArrayAdapter` to populate a `ListView` with the titles of the post items.

A dummy activity could be like the following example:

```kotlin
package io.github.diamantidis.androidApp

import android.content.Context
import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.*
import io.github.diamantidis.feedreader.factory.PresenterFactory
import io.github.diamantidis.feedreader.model.Feed
import io.github.diamantidis.feedreader.model.Item
import io.github.diamantidis.feedreader.presentation.FeedView
import io.github.diamantidis.feedreader.presenter.FeedPresenter

class MainActivity : AppCompatActivity(), FeedView {
    override fun showData(feed: Feed) {
        adapter.clear()
        adapter.addAll(feed.items)
    }

    override fun showLoading() {
        print("Loading")
    }

    override fun showError(error: Throwable) {
        print("show error: ${error.message}")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val listView = ListView(this)
        adapter = FeedAdapter(this, mutableListOf())
        listView.adapter = adapter

        presenter.loadData()

        this.setContentView(listView)
    }

    private lateinit var adapter: FeedAdapter
    private val presenter: FeedPresenter by lazy { PresenterFactory.createFeedPresenter(this) }

    private inner class FeedAdapter(context: Context, items: List<Item>) :
        ArrayAdapter<Item>(context, -1, -1, items) {

        override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {

            val item = super.getItem(position)
            val listLayout = LinearLayout(context)
            listLayout.layoutParams = AbsListView.LayoutParams(
                AbsListView.LayoutParams.WRAP_CONTENT,
                AbsListView.LayoutParams.WRAP_CONTENT
            )
            val listText = TextView(context)
            listText.setPadding(40, 40, 0, 40)
            listText.text = item?.title

            listLayout.addView(listText)

            listLayout.setTag(item)
            return listLayout
        }
    }
}
```

Besides that, a few more changes are required on the `build.gradle` and the `AndroidManifest.xml`. All these changes can be found on [this GitHub commit](https://github.com/diamantidis/BlogApp/commit/3b6b5d7a25bb3e358f4dbd375960e57b8f363929).


## iOS app

Similarly for iOS, we follow a similar procedure; implement the `FeedView` interface from our `UIViewController`, lazy initialize the `FeedPresenter` and then call the `loadData` function, though instead of a `ListView` we make use of the equivalent on iOS, which is a `UITableView`.

A dummy UIViewController could be like the following example:

```swift
import UIKit
import shared

class ViewController: UIViewController, FeedView {

    func showError(error: KotlinThrowable) {
        activityIndicatorView.stopAnimating()
    }

    func showData(feed: Feed) {
        activityIndicatorView.stopAnimating()
        self.tableView.separatorStyle = .singleLine
        self.posts = feed.items
        self.tableView.reloadData()
    }

    func showLoading() {
        self.tableView.separatorStyle = .none
        activityIndicatorView.startAnimating()
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        self.view.addSubview(tableView)
        NSLayoutConstraint.activate([
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            tableView.topAnchor.constraint(equalTo: view.topAnchor)
        ])

        tableView.backgroundView = activityIndicatorView
        presenter.loadData()
    }

    private var posts = [Item]()
    private lazy var presenter = PresenterFactory.Companion().createFeedPresenter(view: self)
    private lazy var activityIndicatorView = UIActivityIndicatorView(activityIndicatorStyle: .gray)

    private lazy var tableView: UITableView = {
        var tableView = UITableView()
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "MyCell")
        tableView.dataSource = self
        tableView.delegate = self
        tableView.separatorStyle = .none
        tableView.translatesAutoresizingMaskIntoConstraints = false
        return tableView
    }()
}

extension ViewController: UITableViewDelegate, UITableViewDataSource {
    func numberOfSections(in tableView: UITableView) -> Int {
        return posts.isEmpty ? 0 : 1
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return posts.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "MyCell", for: indexPath as IndexPath)
        cell.accessoryType = .disclosureIndicator
        cell.textLabel!.text = posts[indexPath.row].title
        return cell
    }
}
```

Again, all the changes required to build a dummy iOS app that will use the JSON feed reader library, can be found on [this GitHub commit](https://github.com/diamantidis/BlogApp/commit/8c69b9ef7d856c3fb26c1d7eda0fb3c0f4ebae9b).

## Conclusion

To sum up, this post describes how to implement a JSON feed reader library with Kotlin Native and how to use it from both an Android and an iOS app. While building this library, we have seen how to use `ktor` to implement the network request, utilize `kotlinx-serialization`'s power to de-serialize the JSON response into a Kotlin object, learn how to work with `coroutines` and take advantage of the `MVP` pattern to communicate between the Kotlin Native library and the native application. 

Definitely the process of building this app, though it still lacks some basic functionality, helped me a lot to get more acquainted with Kotlin Native.
Next step? To iterate over this implementation and add some more features like presenting the content of the post or adding some caching layer!!

Thanks for reading and should you have any questions, suggestions or comments, just let me know on [Twitter](https://twitter.com/diamantidis_io) or [email me](mailto:diamantidis@outlook.com)!!
