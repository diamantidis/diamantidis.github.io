---
layout: post
title: "Swift ❤️ GraphQL: How to create a GraphQL server with Vapor and an iOS app as a client"
description: A step-by-step guide on how to implement an end-to-end GraphQL use case in Swift using Vapor for the server and Apollo iOS Client for the iOS app
date: 2020-05-24 06:00 +0200
comments: true
tags: [Swift, Vapor, GraphQL, Apollo, iOS]
---

Nowadays, it's quite common for many iOS apps to rely on the communication with a server to deliver their services to the user. And while in most cases this communication is via a REST API, there are other API paradigms as well. One such example is [GraphQL], and this is going to be the topic of this post.

In this post, I am going to show you how to create an end-to-end GraphQL use case with Swift. First I will create a GraphQL server using [Vapor] and then I will build an iOS app that will make a query to fetch information from this server.

Let's see how!!

## Vapor

We will start by creating a new Vapor project! For this example, we are going to use the version 4 of Vapor and you can follow the detailed instruction on [Vapor's documentation site].

Briefly,
* Use `Homebrew` and run `brew install vapor/tap/vapor-beta` to install the [Vapor Toolbox].
* Run `vapor-beta new <Your Project> -n` to create a new project. 
* Once completed, move to the project directory with `cd <Your Project>`.
* Run the command `vapor-beta xcode` to open Xcode.
* Build and try to run the app.
* Visit [`localhost:8080`](localhost:8080) on your browser and you should be able to see the message `It works!`! :tada:

Now that we have our basic server running, let's move on and add the GraphQL server.

## GraphQL server

First, we are going to add the dependencies. More specifically, we are going to use [GraphQLKit] which makes it easy to setup a GraphQL server with Vapor. 

Let's open the file `Package.swift` and append the list of dependencies with the following line:
```swift
.package(name: "GraphQLKit", url: "https://github.com/alexsteinerde/graphql-kit.git", from: "2.0.0-beta.1"),
```

After that, append the list of dependencies for the app target with `"GraphQLKit"`.

Once we are done with the dependencies, it's time to add our Model class. For this example, I am going to use a simple model of a Post, so let's add the following snippet.


```swift
struct Post: Codable {
    var id: Int
    var title: String

    init(id: Int, title: String) {
        self.id = id
        self.title = title
    }
}
```

Then, we are going to create our Controller.

```swift
import Vapor
import GraphQLKit

final class PostController {
    func fetchPosts(request: Request, _: NoArguments) throws -> [Post] {
        return posts
    }

    private var posts = [
        Post(id: 1, title: "My first post")
    ]
}
```

In this snippet, we define a function that will return all the posts. For this example, and to keep things simple, we are going to use the private property `posts` as our in-memory storage. 


After that, we will implement two extensions to make both `Post` and `PostController` conform to the protocol `FieldKeyProvider`.

`Graphiti` uses the protocol `FieldKeyProvider` to define the keys that we will use to map the properties of our Model and the function of our Controller to the types and queries of the GraphQL schema.

```swift
import GraphQLKit

extension Post: FieldKeyProvider {
    typealias FieldKey = FieldKeys

    enum FieldKeys: String {
        case id
        case title
    }
}

extension PostController: FieldKeyProvider {
    typealias FieldKey = FieldKeys

    enum FieldKeys: String {
        case fetchPosts
    }
}
```

With that in place, we can create our schema by mapping the keys of the `FieldKeyProvider` extensions to the properties of our Model and the function of our Controller.

```swift
import GraphQLKit

enum Schemas {
    static var postSchema = Schema<PostController, Request>([
        Type(Post.self, fields: [
            Field(.title, at: \.title),
            Field(.id, at: \.id),
        ]),
        Query([
            Field(.fetchPosts, at: PostController.fetchPosts),
        ]),
    ])
}
```

Finally, we can open the `routes.swift`, add the line `import GraphQLKit` and register our GraphQL schema by adding the following line:

```swift
app.register(graphQLSchema: Schemas.postSchema, withResolver: PostController())
```

You can now build and run the app! :tada:

> The code for this server is available on [GitHub](https://github.com/diamantidis/vapor-graphql/tree/b3afc1f).

## Apollo CLI

To verify the schema we are going to use a tool called [Apollo CLI]. To install it globally, run the following command: `npm install -g apollo`.

Once installed, you can use the following command to download the schema.
```sh
apollo schema:download --endpoint=http://127.0.0.1:8080/graphql schema.json
```

This command will generate the `schema.json` file which will contain the GraphQL schema. It is going to be a really big file, but if you open it and search for the term `fetchPost` you will be able to find the definition for our query. 

This file will also be used going forward to the iOS implementation. Let's see how!

## iOS app 

For the iOS part, we are going to create a simple app that will make a query to the Vapor GraphQL server and fetch the posts. 

To do so, we are going to use the [Apollo iOS] client. Let's install it via CocoaPods.

First, add `pod "Apollo"` on your `Podfile` and run `bundle exec pod install`.

Next, let's open the `.xcworkspace` file and inside our app Group, let's create a new Group with the name `GraphQL`. This group is where we will place all the GraphQL related logic. Navigate to this directory using your Terminal and run the following command to download the schema. 
```sh
apollo schema:download --endpoint=http://127.0.0.1:8080/graphql schema.json
```

Then, back to Xcode, use `⌃`(Control) click on the `GraphQL` group, choose the option "Add files to ...". and add the `schema.json` file.

On this directory, create a new file named `AllPosts.graphql` and as a content add the query to fetch all the posts:

```graphql
query AllPosts {
  fetchPosts {
    id
    title
  }
}
```

Then, go back to the terminal and from the root directory of your project, run the command (replacing the `path/to` with the right path for your project):

```sh
./Pods/Apollo/scripts/run-bundled-codegen.sh codegen:generate \
    --target=swift \
    '--includes=./**/*.graphql'  \
    --localSchemaFile=./path/to/GraphQL/schema.json \
    ./path/to/GraphQL/API.swift
```

This will generate the file `API.swift`, which will contain a class for the query we defined earlier.
Head back to Xcode and also add this file to the `GraphQL` folder. 

Now, let's create the client that will execute the query. Still inside the `GraphQL` folder, create a new file and add the following content:

```swift
import Foundation
import Apollo

enum GraphQLClient {
    static var apollo = ApolloClient(url: URL(string: "http://127.0.0.1:8080/graphql")!)
}
```

If we were to execute the query now, we would be able to fetch the posts from the server but they would be of a type defined by the `codegen.sh` command that we ran previously. It would be nice if we could use the same model as in our backend. Let's copy the `Post` struct from the backend project and replace the `init` so that it accepts a parameter of the type defined by `Apollo`:

```swift
struct Post: Codable {
    var id: Int
    var title: String

    init(post: AllPostsQuery.Data.Post) {
        self.id = post.id
        self.title = post.title
    }
}
```

Now we are ready perform the query in the following fashion:

```swift
let query = AllPostsQuery()
GraphQLClient.apollo.fetch(query: query) { result in
    guard let data = try? result.get().data else { return }
    let posts = data.posts.map{ Post(post: $0)}
    print(posts)
}
```

If you now run the app and open the console, you will be able to see something like 
```swift
[<ProjectName>.Post(id: 1, title: "My first post")]
```
And that's about it!! 

> The code for this app is available on [GitHub](https://github.com/diamantidis/ios-graphql/tree/4bc583a).


# Conclusion

In this post we have seen how to implement a GraphQL server using Vapor and an iOS app using the Apollo client to fetch the posts from the server. 
For this post I have used a quite simple example, for the sake of demonstrating how we can achieve the communication between the client and the server.

In the post to come, we are going to explore how to add support for sorting, filtering, creating a new post, editing an existing, deleting, etc.

So stay tuned and follow me on [Twitter] should you want to get notified once these posts are published or you have a question or comment about this post.

Thanks for reading this post, and see you next time!


[GraphQL]: https://graphql.org/
[Vapor]: https://github.com/vapor/vapor
[Vapor's documentation site]: https://docs.vapor.codes/4.0/install/macos/
[Vapor Toolbox]: https://github.com/vapor/toolbox
[GraphQLKit]: https://github.com/alexsteinerde/graphql-kit

[Apollo CLI]: https://www.apollographql.com/docs/devtools/cli/

[Apollo iOS]: https://www.apollographql.com/docs/ios/

[Twitter]: https://twitter.com/diamantidis_io
