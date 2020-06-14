---
layout: post
title: GraphQL mutations for iOS apps (with the help of Combine's Future)
description: A guide on how to perform GraphQL mutations on an iOS app built with Swift using Combine's Future and Promises
date: 2020-06-14 06:00 +0200
comments: true
tags: [Swift, GraphQL, iOS]
image:
    path: /assets/social/graphql-mutations-for-ios-apps.png
    width: 863
    height: 512
twitter:
    card: summary_large_image
---

Nowadays, more and more apps rely on a server to support their functionality. One part of this communication is the ability of the app to create new and modify existing data stored on the server.

In GraphQL terms, this can be accomplished with the so-called `Mutations`. GraphQL uses the term `Mutations` to distinguish the queries that will result in some kind of side-effect on the server-side data, from the normal queries that we are using to just fetch data.

Long story short, in this post, we are going to see how we can perform GraphQL mutations from an iOS app using the [Apollo iOS client] and with a little help from [Combine's Future].

The scenario that we want to accomplish is quite simple. First, we are going to fetch some data from the server and then we are going to create a new entry. Once it is created, we will update it and finally delete it.

## Prerequisites

This post is a continuation of a series of posts about GraphQL and Swift. In the previous posts, we have seen [how to setup an iOS project to fetch] and [decode data from a GraphQL server]. This time we will see how to modify server-side data using GraphQL's mutations.

For the server, we are going to use a GraphQL server built with the Vapor framework. The project, along with instructions on how to set it up, is available on [GitHub](https://github.com/diamantidis/vapor-graphql) or you can refer to the previous posts to learn more on [how to setup], [add fields with custom types] and [add mutations].

Also, the iOS project will be based on the project we have built on the previous posts. This project and the instructions on how to set it up are also available on [GitHub](https://github.com/diamantidis/ios-graphql).

In those previous posts, I was using a model representing a post and I will continue doing so on this post as well.

## A Future and Promise Primer

As I mentioned before, we are going to use [Combine's Future].

Future was introduced on iOS 13 and is a `Publisher` that represents the result of an asynchronous operation. Practically, it will generate a single value or an error and then it will finish.


Future is defined as a generic with two types, one for the type of the value and one for the type of the error.
Its initializer takes a single argument, which is a closure of type `(Promise) -> Void`.


As you can see, the closure has an argument of type `Promise`. `Promise` itself is a closure that takes a `Result` as a single parameter and is defined as a typealias for `(Result<Output, Failure>) -> Void`.


Inside Future's closure, we are using the instance of `Promise` and pass either `.success` or `.failure` as a parameter to determine if the asynchronous operation was successful or not.

Let's see a simple example:

```swift
enum AppError: Error {
    case random
}

let future = Future<String, AppError> { promise in
    if true {
        promise(.success("🎉"))
    } else {
        promise(.failure(AppError.random))
    }
}
```
In this example, our Future can either generate a `String` value or it will fail with an error of type `AppError`. Then, inside the closure, we are passing the result to the promise closure.

And that'a brief intro to Combine's Future. Let's now jump to the GraphQL mutations!

## Implementation

Having setup the project as it was at the end of the [previous post], we will have to update the schema to fetch the definitions for the mutations.

With the server running, run the following command from the root directory of the iOS project to update the `schema.json`.

```sh
apollo schema:download --endpoint=http://127.0.0.1:8080/graphql iOSGraphQL/GraphQL/schema.json
```

Once completed, we will head over to Xcode and inside the GraphQL group, we will create three files for the three mutations: `CreatePost.graphql`, `EditPost.graphql` and `DeletePost.graphql`.

Add the following snippets as content on these files respectively:

```js
# CreatePost.graphql
mutation CreatePost($input: PostInput!) {
  createPost(input: $input) {
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

```js
# EditPost.graphql
mutation EditPost($id: CustomUUID!, $title: String!, $tags: [Tag!]!) {
  editPost(id: $id, tags: $tags, title: $title) {
    id
    title
    publishedAt
    tags
  }
}
```

```js
# DeletePost.graphql
mutation DeletePost($id: CustomUUID!) {
  deletePost(id: $id)
}
```

All those queries follow the same pattern. We set the arguments, pass them to the mutation, and define the result data. With all the queries in place, we will run the `apollo codegen:generate` command to update the `API.swift`.

```sh
./Pods/Apollo/scripts/apollo/bin/apollo codegen:generate --target=swift '--includes=./**/*.graphql' --localSchemaFile=./iOSGraphQL/GraphQL/schema.json --passthroughCustomScalars ./iOSGraphQL/GraphQL/API.swift
```

Before adding the implementation for the mutation, let's create a function that will be responsible for fetching the existing posts. The return type will be a `Future` with `[Post]` as the `Output` type and `GraphQLError` as the `Failure` type and it will look like the following snippet:

```swift
private func fetchPosts() -> Future<[Post], GraphQLError> {
    let query = AllPostsQuery()

    let future = Future<[Post], GraphQLError> { promise in
        GraphQLClient.apollo.fetch(query: query) { result in
            guard let data = try? result.get().data else {
                return promise(.failure(GraphQLError.fetchError))
            }
            let posts = data.posts.map { Post(post: $0) }
            return promise(.success(posts))
        }
    }

    return future
}
```

In this snippet, we are creating an instance of the query that we want to perform and then we create a future. Inside the Future's closure, we will initialize the fetch request and once it's completed, we will try to get the response. If the response is an error, then we are going to reject the Future by passing an error to its promise.
Otherwise, we will map the response to the `Post` model and then pass `.success` with this list of posts to the promise.

For the scope of this post, the `GraphQLError` will be a simple Error enum:
```swift
enum GraphQLError: Error {
    case fetchError
    case createError
    case editError
    case deleteError
}
```

Now, let's see how we can perform the mutation queries!

Following the same logic as with the `fetchPosts`, we are going to add three more functions to create, update, and delete a post:

```swift
    private func createPost(title: String, tags: [Tag], authorId: CustomUUID) -> Future<CreatePostMutation.Data.CreatePost, GraphQLError> {
        let input = PostInput(authorId: authorId, tags: tags, title: title)
        let mutation = CreatePostMutation(input: input)

        let future = Future<CreatePostMutation.Data.CreatePost, GraphQLError> { promise in
            GraphQLClient.apollo.perform(mutation: mutation) { result in
                guard let post = try? result.get().data?.createPost else {
                    return promise(.failure(.createError))
                }
                return promise(.success(post))
            }
        }
        return future
    }
```
```swift
    private func editPost(with id: CustomUUID, title: String, tags: [Tag]) -> Future<EditPostMutation.Data.EditPost, GraphQLError> {
        let mutation = EditPostMutation(id: id, title: title, tags: tags)

        let future = Future<EditPostMutation.Data.EditPost, GraphQLError> { promise in
            GraphQLClient.apollo.perform(mutation: mutation) { result in
                guard let post = try? result.get().data?.editPost else {
                    return promise(.failure(.editError))
                }
                return promise(.success(post))
            }
        }

        return future
    }
```

```swift
    private func deletePost(with id: CustomUUID) -> Future<Bool, GraphQLError> {
        let mutation = DeletePostMutation(id: id)

        let future = Future<Bool, GraphQLError> { promise in
            GraphQLClient.apollo.perform(mutation: mutation) { result in
                guard let result = try? result.get().data?.deletePost else {
                    return promise(.failure(.deleteError))
                }
                return promise(.success(result))
            }
        }

        return future
    }
```

In all these 3 functions, we are following the same logic. We accept a set of arguments, which we use to create an instance of a mutation. Those Mutation classes were generated based on the GraphQL queries when we ran the `apollo codegen:generate` command.

Then we create a future and inside its closure we perform the mutation request. Once it is completed, we check if the response is successful or not, and based on that we pass the corresponding result on the promise.


Lastly, we will need to provide an extension for the `CustomUUID` structure to make it conform to the `JSONEncodable` protocol. This will allow us to use it as an argument on the GraphQL mutation queries.

```swift
extension CustomUUID: JSONEncodable {
    public var jsonValue: JSONValue {
        return ["value": value.uuidString]
    }
}
```

Now, let's see how we can use those functions to make the requests.
`Future` conforms to `Publisher` which means that we can use any of the `Publisher`'s functions. In our case, we are going to use `flatMap` and `sink` to combine and trigger the sequence of operations.

```swift
cancellable = self.fetchPosts()
    .flatMap { posts in
        return self.createPost(title: "New post", tags: [.swift], authorId: posts.first!.author.id)
    }
    .flatMap { post -> Future<EditPostMutation.Data.EditPost, GraphQLError> in
        let updatedTags = post.tags + [.vapor, .graphQl]
        return self.editPost(with: post.id, title: "Updated Title", tags: updatedTags)
    }
    .flatMap { post in
        return self.deletePost(with: post.id)
    }
    .sink(
        receiveCompletion: { print($0) },
        receiveValue: { print($0) }
    )
```

In this snippet, we first call `fetchPosts` to fetch the list of posts and then using `flatMap` we pass the response and trigger the next request. Finally, we call `sink`. As you can see from the snippet, `sink` takes two parameters. The first one (`receiveComplete`) is a closure that gets executed on completion, be it a success or an error, while the second one (`receiveValue`) is a closure that gets executed every time we receive a new value from the publisher.

Since `Future` performs operations asynchronously, we need to keep a reference to the cancellable that the call to `sink` returns. Otherwise, Swift will destroy it by the time it exits the scope, and thus the closures will never get called.

```swift
// class scope
private var cancellable: AnyCancellable?
```

Finally, make sure to call `cancellable?.cancel()` on the `deinit`.

And that was it! If you now run the app, it will execute those queries in order. If you want to "see" the flow of events, you can use the `.print()` function between the `.flatMap` calls and it will print the events.

> All the code from this post is also available on [GitHub].

## Conclusion

To sum up, in this post, we have made a brief introduction to Combine's `Future` and `Promise` and we have seen how we can use them to perform GraphQL mutations. More specifically, we have seen how to implement the logic to sequentially create, edit, and delete a post.

Thanks for reading, I hope you find this post useful.

If you like this post and you want to get notified when a new post is published, you can follow me on [Twitter] or subscribe to the [RSS feed].

Also, if you have any questions or comments about this post, feel free to contact me on [Twitter]!

Until next time!


[Apollo iOS client]: https://www.apollographql.com/docs/ios/

[how to setup an iOS project to fetch]: {%post_url 2020-05-24-swift-loves-graphql-server-with-vapor-and-ios-app-client %}
[decode data from a GraphQL server]: {%post_url 2020-05-31-custom-graphql-types-on-swift-projects %}
[a previous post]: {%post_url 2020-05-31-custom-graphql-types-on-swift-projects %}

[how to setup]: {%post_url 2020-05-24-swift-loves-graphql-server-with-vapor-and-ios-app-client %}
[decode data from a GraphQL server]: {%post_url 2020-05-31-custom-graphql-types-on-swift-projects %}
[add fields with custom types]: {%post_url 2020-05-31-custom-graphql-types-on-swift-projects %}
[add mutations]: {%post_url 2020-06-07-mutations-on-a-graphql-server-built-with-vapor %}

[Combine's Future]: https://developer.apple.com/documentation/combine/future

[previous post]: {%post_url 2020-05-31-custom-graphql-types-on-swift-projects %}

[GitHub]: https://github.com/diamantidis/ios-graphql/tree/94d390a

[RSS feed]: {{ "feed.xml" | absolute_url }}
[Twitter]: https://twitter.com/diamantidis_io
