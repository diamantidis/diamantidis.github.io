---
layout: post
title: Custom GraphQL types on Swift projects
description: A post about the use of GraphQL custom types like scalar, object, enums and list on Swift projects (Vapor on the server side project and an iOS app on the client side)
date: 2020-05-31 06:00 +0200
comments: true
tags: [Swift, Vapor, GraphQL, Apollo, iOS]
image:
    path: /assets/social/graphql-types-swift.jpg
    width: 769
    height: 512
twitter:
    card: summary_large_image
---

By default, [GraphQL] supports only a handful of basic types that we can use on the schema definition. This list includes `Int`, `Float`, `String`, `Boolean` and `ID`. But as you can easily understand relying solely on these types is quite restrictive. What if we want to add a date field? Or some other kind of data?

Hopefully for us, GraphQL offers plenty of flexibility when it comes to constructing a model with custom types; be it a custom object type, a custom scalar type, enums or a list to name a few. 

And that's what we are going to investigate in this post. We will see how we can use all these custom types on Swift projects.

## Before we start

In a [previous post], I described how to create a simple GraphQL server in Swift using [Vapor] and an iOS app to fetch information from this server using the [Apollo iOS] client. For that post, I used a simple `Post` type with an `id` and a `title` property.

This time, we are going one step further and we will enrich the `Post` type by adding some more properties. We are going to introduce a custom scalar type that we will use for the id of the model, a Date field for the date that the post was published, a list of enums for the tags and a custom object for the author of the post. 

As a side note before we start, the code in this post is a continuation of the code from the [previous post] that I mentioned earlier. If you want to go through the code as you read this post, you can find on Github a branch on the version of the project at the end of the previous post ([server](https://github.com/diamantidis/vapor-graphql/tree/b3afc1f) & [client](https://github.com/diamantidis/ios-graphql/tree/4bc583a)) and a branch with the version of the code at the end of this post ([server](https://github.com/diamantidis/vapor-graphql/tree/f414bb1) & [client](https://github.com/diamantidis/ios-graphql/tree/c95ebe4)). If you want to learn more about the setup and how to run those projects, either refer to my [previous post] or to the README file of each project. 

Following the same pattern as in the previous post, let's start with the updates on the server side and then we will update the iOS app.

## Server

To begin with, let's introduce three new types. The first one will be a new structure named `CustomUUID` that we will as a type for the `id` property. The second one will be an `enum` named `Tag` that we are going to use for the type of the list of tags and lastly a structure name `Author` to represent the author of the post. 

```swift
// CustomUUID.swift
struct CustomUUID: Codable {
    let value: UUID
}
```

```swift
// Tag.swift
enum Tag: String, Codable {
    case swift = "Swift"
    case vapor = "Vapor"
    case graphql = "GraphQL"
}
```

```swift
// Author.swift
struct Author: Codable {
    let id: CustomUUID
    let name: String
    let twitter: String
}
```

Once all those types are added, we can update our `Post` model to look like the following snippet:

```swift
// Post.swift
struct Post: Codable {
    let id: CustomUUID
    let title: String
    let publishedAt: Date
    let tags: [Tag]
    let author: Author
}
```

After that, we will update the `FieldKeyProvider` extension for the `Post` and add a new key for each new property. We will later use those keys on the schema definition to map the fields of the GraphQL schema to the properties of the `Post` structure. The final version of the `Post` extension will look like this:

```swift
// GraphQL+FieldKeyProvider.swift
extension Post: FieldKeyProvider {
    typealias FieldKey = FieldKeys

    enum FieldKeys: String {
        case id
        case title
        case publishedAt
        case tags
        case author
    }
}
```

Since we have add a new structure, the `Author`, we will also add an extension for this structure to add conformance to the `FieldKeyProvider` protocol. The extension will be like in the following snippet:

```swift
// GraphQL+FieldKeyProvider.swift
extension Author: FieldKeyProvider {
    typealias FieldKey = FieldKeys

    enum FieldKeys: String {
        case id
        case name
        case twitter
    }
}
```

Now, we can move on and update the definition of the GraphQL schema:

```swift
// Schema.swift
enum Schemas {
    static var postSchema = Schema<PostController, Request>([
        Enum(Tag.self, [
            Value(.swift)
                .description("About Swift"),
            Value(.vapor)
                .description("About Vapor"),
            Value(.graphql)
                .description("About GraphQL"),
        ])
            .description("Tags"),

        Scalar(CustomUUID.self)
            .description("My custom UUID"),

        Scalar(Date.self)
            .description("Date Type"),

        Type(Author.self, fields: [
            Field(.id, at: \.id),
            Field(.name, at: \.name),
            Field(.twitter, at: \.twitter)
        ]),

        Type(Post.self, fields: [
            Field(.id, at: \.id),
            Field(.title, at: \.title),
            Field(.publishedAt, at: \.publishedAt),
            Field(.tags, at: \.tags),
            Field(.author, at: \.author),
        ]),

        Query([
            Field(.posts, at: PostController.fetchPosts),
        ]),
    ])
}
```

In this snippet, we have added the definition of the enum and all of its cases, the definition of the `CustomUUID` and Swift's `Date`, a definition of the new `Author` type and updated the definition of the `Post` type to include the new fields.

> **WARNING**: The order of the definitions in the schema does matter. If we were to place the definition of the `CustomUUID` after the definition of the `Post`, we would get an exception saying `Fatal error: 'try!' expression unexpectedly raised an error: Cannot use type "CustomUUID" for field "id". Type does not map to a GraphQL type.`.


Lastly, we are going to update the data that the GraphQL server will return to the client and add values for the new fields:

```swift
// PostController.swift
private lazy var author = Author(
    id: CustomUUID(value: UUID()),
    name: "Ioannis Diamantidis",
    twitter: "@diamantidis_io"
)

private lazy var posts = [
    Post(
        id: CustomUUID(value: UUID()),
        title: "My first post",
        publishedAt: Date(),
        tags: [.swift, .graphql, .vapor],
        author: self.author
    )
]
```

> **NOTE:** I could have used `UUID` directly instead of the `CustomUUID`, but for the sake of demonstration, I preferred to use a custom container structure. If you want to use the `UUID`, you can follow the same logic as with the `Date` type.


And this is it for the server side! You can now build and run the project!

> The code with all those changes is also available on [GitHub](https://github.com/diamantidis/vapor-graphql/tree/f414bb1).

Let's now jump on to the client side and the iOS app!

## iOS

First and foremost, we will get the updated version of the GraphQL schema. With the server running, run the following command from the root directory of the iOS project to update the `schema.json`.

```sh
apollo schema:download --endpoint=http://127.0.0.1:8080/graphql iOSGraphQL/GraphQL/schema.json
```

Once this is done, let's open Xcode and update the query file(`AllPosts.graphql`) to add the new fields. We are going to add the `tags` and the `publishedAt` in the same way as we added the `id` and `title` fields, but for the `author` field, we are going to use the concept of [GraphQL's fragments](https://graphql.org/learn/queries/#fragments). Fragments are reusable components that you can use to split the query definition in smaller chunks and use them in multiple queries.

In our case, we will define a fragment on the `Author` type and then use it on the `AllPosts` query to fetch the author of the post.

The final version of the query file will be like the following snippet:

```graphql
fragment AuthorDetails on Author {
  id
  name
  twitter
}

query AllPosts {
  posts {
    id
    title
    publishedAt
    tags
    author {
      ...AuthorDetails
    }
  }
}
```

Now, let's jump back to the Terminal and run the following command from the root directory to update `API.swift`.
```bash
./Pods/Apollo/scripts/run-bundled-codegen.sh codegen:generate \
    --target=swift \
    '--includes=./**/*.graphql'  \
    --localSchemaFile=./path/to/GraphQL/schema.json \
    ./path/to/GraphQL/API.swift
```

If you build and run the app right now, you will get some errors like `Type of expression is ambiguous without more context` and `Use of unresolved identifier 'CustomUUID'`. 

To fix those errors, we will have to add definition for the new structures that we introduced on the GraphQL schema. 

Let's start with the `Author` which will have the following definition: 

```swift
// Author.swift
struct Author {
    var id: CustomUUID
    var name: String
    var twitter: String

    init(author: AuthorDetails) {
        self.id = author.id
        self.name = author.name
        self.twitter = author.twitter
    }
}
```

In this snippet, we map the properties of the structure `AuthorDetails` to the properties of our domain model. `AuthorDetails` is the structure that the [Apollo iOS] client generated when we run the `run-bundled-codegen.sh` command. 

Next, let's add the definition for the `CustomUUID`:

```swift
// CustomUUID.swift
public struct CustomUUID: JSONDecodable {
    let value: UUID

    public init(jsonValue value: JSONValue) throws {
        guard let stringValue = (value as AnyObject)["value"] as? String, let uuid = UUID(uuidString: stringValue) else {
            throw JSONDecodingError.couldNotConvert(value: value, to: CustomUUID.self)
        }

        self.value = uuid
    }
}
```

Here, we make `CustomUUID` conform to Apollo's protocol `JSONDecodable` and fulfill the `init(jsonValue value: JSONValue)` requirement. 
`JSONDecodable` is a protocol that we use to add the logic about decoding the values of custom scalar types. 


The same applies for the `publishedAt` field and its `Date` type, with the only difference being that this time we will add an extension to the Swift's `Date` structure instead of adding a new one.

```swift
extension Date: JSONDecodable {
    public init(jsonValue value: JSONValue) throws {
        
        guard let timeInterval = try? TimeInterval(jsonValue: value) else {
            throw JSONDecodingError.couldNotConvert(value: value, to: Date.self)
        }
        self = Date(timeIntervalSinceReferenceDate: timeInterval)
    }
}
```
Lastly, we will update the `Post` structure, where we will add the new fields and update the initializer to instantiate them.

```swift
// Post.swift
struct Post {
    let id: CustomUUID
    let title: String
    let publishedAt: Date
    let tags: [Tag]
    var author: Author

    init(post: AllPostsQuery.Data.Post) {
        self.id = post.id
        self.title = post.title
        self.publishedAt = post.publishedAt
        self.tags = post.tags
        self.author = Author(author: post.author.fragments.authorDetails)
    }
}
```

Now we are ready to build and run the app. If you do so, you should be able to see the post object with all its properties on the console! :tada:

> The code with all those changes is also available on [GitHub](https://github.com/diamantidis/ios-graphql/tree/c95ebe4).

## Conclusion 

And that's about it! In this post, we have seen how to use GraphQL's features like custom scalar types, enums, lists and custom objects to enhance the `Post` model with fields like the `uuid`, the `publishedAt`, the `tags` and the `author`.

Knowing about those possibilities is really valuable when working with GraphQL and can make a huge difference when it comes to designing a GraphQL schema. 

In the posts to come, we are going to see how further improve this project by adding support for sorting, filtering, creating a new post, editing an existing, deleting, etc. So stay tuned and follow me on [Twitter] should you want to get notified once these posts are published or you have a question or comment about this post.

Thanks for reading this post, and see you next time!


[GraphQL]: https://graphql.org/
[previous post]: {%post_url 2020-05-24-swift-loves-graphql-server-with-vapor-and-ios-app-client %}
[Vapor]: https://github.com/vapor/vapor
[Apollo iOS]: https://www.apollographql.com/docs/ios/
[Twitter]: https://twitter.com/diamantidis_io
