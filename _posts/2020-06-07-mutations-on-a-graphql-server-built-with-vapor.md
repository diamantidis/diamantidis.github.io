---
layout: post
title: Mutations on a GraphQL server built with Vapor
description: A post describing how to add mutations to create, edit and delete entries on a GraphQL server built with Vapor
date: 2020-06-07 06:00 +0200
comments: true
tags: [Swift, Vapor, GraphQL]
image:
    path: /assets/social/mutations-on-a-graphql-server-built-with-vapor.png
    width: 828
    height: 512
twitter:
    card: summary_large_image
---

One characteristic of a complete API is its ability to allow clients to modify the server-side data. This can be in the form of creating new entries, updating or deleting existing ones, etc. Building a GraphQL server couldn't be any different.

To describe this kind of features, GraphQL uses the term `Mutations`. Mutations are just like normal queries. The only difference is that they make it explicit that they will result in some kind of side-effect on the server-side data. 

And that's where this post will focus on. I am going to describe how to add the mutations to create, edit, and delete an entry on a GraphQL server built with Vapor.

## Prerequisites

The code in this post is a continuation of the code from my two latest posts. In the first one, I described [how to setup a GraphQL server with Vapor] and in the second I focused on [how to use custom types on this GraphQL server]. 

If you want to go through the code as you read the post, the code from the previous posts as well as the code from this post is available on [GitHub].

Now, let's get started!

## Implementation

### Prepare the models

First, and before we jump into the mutations, we need to adjust our existing models to support the mutations. 

For example, when it comes to the edit mutation, we will have to update some properties of the `Post` model from constant to variable properties. 
```diff
 struct Post: Codable {
     let id: CustomUUID
-    let title: String
+    var title: String
     let publishedAt: Date
-    let tags: [Tag]
+    var tags: [Tag]
     let author: Author
 }
```

Similarly, in order to be able to filter the posts by the `id` property, we will have to make `CustomUUID` conform to the `Equatable` protocol.

```diff
-struct CustomUUID: Codable {
+struct CustomUUID: Codable, Equatable {
```

With our models ready, we can now move on and start adding the logic for the mutations!

## Delete mutation

Let's start with the logic for the `deletePost` mutation. For this mutation, we will expect the `id` of the `Post` to delete as an argument. Then, using this `id`, we will search for the `Post` in the in-memory list. If we manage to find the post, we are going to remove it and return `true` to the client. Otherwise, we will return `false` to let the client know that we didn't manage to find the `Post`.

> For the sake of this post, I am using a `Bool` as a return type. Ideally, we should return an error Type, but to keep this post focused on the mutations, I decided to go with the `Bool`.


So, let's add an extension to the `PostController` with this logic.

```swift
extension PostController {
    struct DeletePostArguments: Codable {
        let id: CustomUUID
    }

    func deletePost(request: Request, arguments: DeletePostArguments) -> Bool {
        let postIndex = posts.firstIndex{ $0.id == arguments.id }
        guard let index = postIndex?.indexValue else {
            return false
        }
        posts.remove(at: index)
        return true
    }
}
```

Similarly, let's add the logic for the `editPost` mutation!

## Edit mutation

The edit mutation will allow the user to change the value of the title and the tags for a given post. As a result, this time, we are going to require three arguments; an `id`, which we will use to find the `Post` to edit, as well as a `title` and a `tags` argument, which will contain the updated values for the `title` and `tags` properties respectively.

To keep the logic visually separated, let's add a new extension to `PostController` for the logic related to the edit mutation. This extension will contain a new structure named `EditPostArguments` and a function `editPost` which will be responsible for editing a post. 

The implementation will look like the following snippet:

```swift
extension PostController {
    struct EditPostArguments: Codable {
        let id: CustomUUID
        let title: String
        let tags: [Tag]
    }

    func editPost(request: Request, arguments: EditPostArguments) -> Post? {
        let postIndex = posts.firstIndex { $0.id == arguments.id }
        guard let index = postIndex?.indexValue else {
            return nil
        }

        posts[index].title = arguments.title
        posts[index].tags = arguments.tags
        return posts[index]
    }
}
```

The `EditPostArguments` structure has the three properties that we mentioned before. Then, the `editPost` function will accept those arguments as a parameter and will use the `id` to search for the `Post`. If we can't find it, we will return `nil` to the client. If we manage to find it, we will update the properties of the `Post` with the values on the arguments and return the updated post to the client.

Last but not least, let's see how we can add the functionality to create a new post entity!

## Create mutation

To create a new `Post` we would need a title, a set of tags, and the id of the author. 

It's time to introduce a new GraphQL concept, the inputs. GraphQL distinguishes the types that can be used as input from those that can be used as outputs to queries. For example, in [a previous post], I have used the type `Author` to return the author's data. This is a typical example of an Output type. This kind of types, though, cannot be used when we want to pass arguments, be it in a query or a mutation. In order to define complex types for arguments, there is the concept of `Input`. `Input` is just like a type, with the only difference being the purpose of use and that it can only include scalar, enums, strings, int, float, bool, and other input types. We can not use an `Output` type as a field on an `Input` type. 

So, let's create a `PostInput` type and add the properties that we need to create a new `Post`.

```swift
struct PostInput: Codable {
    let title: String
    let tags: [Tag]
    let authorId: CustomUUID
}
```

Now, we can define the function to create a new `Post` on an extension of the `PostController`.

```swift
extension PostController {
    struct CreatePostArguments: Codable {
        let input: PostInput
    }
    func createPost(request: Request, arguments: CreatePostArguments) -> Post? {
        guard author.id == arguments.input.authorId else {
            return nil
        }
        let post = Post(
            id: CustomUUID(value: UUID()),
            title: arguments.input.title,
            publishedAt: Date(),
            tags: arguments.input.tags,
            author: author
        )
        posts.append(post)
        return post
    }
}
```

In the same way as for the other functions, we define a structure for the type of the arguments. This structure contains a sole field of the type `PostInput` that we defined earlier. Then the function `createPost` takes an instance of this `CreatePostArguments` structure and uses it to create a new `Post` entity, which we later append to the list of existing posts.


And that's about it for the logic part of our mutations. Now, it's time to integrate them into the GraphQL server.


## GraphQL

To make those functions and arguments available on the GraphQL schema, we will have to update the `FieldKeyProvider` extension of the `PostController` and add the keys for them. We will use those keys to map the function and the arguments of `PostController` to the mutations and the arguments of the GraphQL schema.

```diff
    enum FieldKeys: String {
+       case id
+       case title
+       case tags
+       case input
+
        case posts
+       case deletePost
+       case editPost
+       case createPost
    }
```

We will also provide conformance to the `FieldKeyProvider` protocol and define keys for the `PostInput` structure. 

```swift
extension PostInput: FieldKeyProvider {
    typealias FieldKey = FieldKeys

    enum FieldKeys : String {
        case title
        case tags
        case authorId
    }
}
```

Lastly, we will update the GraphQL schema definition on `Schema.swift` by adding the definition for the `PostInput` input type and the definitions for the mutations using the keys we defined on the `FieldKeyProvider` extensions. 

```diff
        Query([
            Field(.posts, at: PostController.fetchPosts),
        ]),
+
+       Input(PostInput.self, [
+           InputField(.title, at: \.title),
+           InputField(.tags, at: \.tags),
+           InputField(.authorId, at: \.authorId)
+       ]),
+
+       Mutation([
+           Field(.deletePost, at: PostController.deletePost)
+               .argument(.id, at: \.id),
+
+           Field(.editPost, at: PostController.editPost)
+               .argument(.id, at: \.id)
+               .argument(.title, at: \.title)
+               .argument(.tags, at: \.tags),
+
+           Field(.createPost, at: PostController.createPost)
+               .argument(.input, at: \.input)
+       ])
+   ])
```
And that's all folks! We can now build and run the vapor server!

## How to test?

To verify what we have done so far, we are going to use a tool named [GraphQL Playground].

The installation process is quite simple, you just have to run `brew cask install graphql-playground`. Then, you can use the  Spotlight Search (`⌘` + `Space bar`) and open the application `GraphQL Playground`.

Once GraphQL Playground is running, we could run the following query to fetch the available posts:

```js
query AllPosts {
  posts {
    id
    author {
        id
    }
  }
}
```

From the response, we are going to keep the id of the author and we will use it to create a new post with the following query (replace `00000000-0000-0000-0000-000000000000` with the UUID from the response):

```js
mutation CreatePost {
  createPost(input: {
    authorId: {
      value: "00000000-0000-0000-0000-000000000000"
    },
    tags: [Swift, Vapor]
    title: "A new post"
  }) {
    id
    title
    publishedAt
    tags
    author {
      id
    }
  }
}
```

This time, keep the id of the post from the response, and use it on the next query to edit the title and the tags of the post:

```js
mutation EditPost {
  editPost(
    id: {
      value: "00000000-0000-0000-0000-000000000000"
    },
    tags: [Swift, Vapor, GraphQL], 
    title: "A new post with an updated title") {
    id
    title
    publishedAt
    tags
  }
}
```

Finally, we can delete the post that we have created using the id of the post from the previous query on the following query:

```js
mutation DeletePost {
  deletePost(id: {
    value: "00000000-0000-0000-0000-000000000000"
  })
}
```

## Conclusion

And that's about it! In this post, we have seen how to add mutations to create, edit and delete a `Post` on a GraphQL server built with Vapor. We have also seen how to take advantage of GraphQL's Inputs for arguments with complex types and how to use [GraphQL Playground] to run our GraphQL queries. 

In the next post, I am going to continue this GraphQL & Swift journey and I am going to investigate how to use the mutations that we defined in this post from an iOS app. 
So stay tuned and follow me on [Twitter] should you want to get notified once the next post is published or you have a question or comment about this post.

Thanks for reading this post, and see you next time!

[GitHub]: https://github.com/diamantidis/vapor-graphql/tree/3db78ea
[how to setup a GraphQL server with Vapor]: {%post_url 2020-05-24-swift-loves-graphql-server-with-vapor-and-ios-app-client %}
[how to use custom types on this GraphQL server]: {%post_url 2020-05-31-custom-graphql-types-on-swift-projects %}
[a previous post]: {%post_url 2020-05-31-custom-graphql-types-on-swift-projects %}
[GraphQL Playground]: https://github.com/prisma-labs/graphql-playground
[Twitter]: https://twitter.com/diamantidis_io
