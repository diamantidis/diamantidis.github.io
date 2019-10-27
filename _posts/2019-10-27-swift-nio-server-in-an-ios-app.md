---
layout: post
title: Running a SwiftNIO Server in an iOS app
description: A post on how to use SwiftNIO to run an HTTP server from an iOS app
date: 2019-10-27 06:00 +0200
comments: true
tags: [Swift, SwiftNIO, iOS]
---

Have you ever wondered if it is possible to run a server in an iOS app? A while ago I had this question!
It seems that [SwiftNIO](https://github.com/apple/swift-nio) and [SwiftNIO Transport Services extension, a.k.a NIOTS](https://github.com/apple/swift-nio-transport-services) are here to help us do so.

SwiftNIO is a non-blocking event-driven network framework and as per the documentation, it is like [Netty](https://netty.io/), but written for Swift, meaning that it is following Netty's architecture and concepts though in a Swifty way. 

To get a better grasp of the architecture, you can refer to [SwiftNIO's documentation](https://github.com/apple/swift-nio#basic-architecture), where you can find a detailed description of the building blocks and how they interact with each other. 

Back to our topic, a potential use case for such an app could be to act as a mock server for other apps. For example, such a mock server app could be used for usability testing, especially if it provides a UI to manipulate the responses and thus enabling the person performing the usability testing to create different scenarios and flows in the app. 

So, for this post, I will try to create a simple app that will start an HTTP server, and this server will handle a GET request and return a JSON response.

## Implementation

# Dependencies

First thing first, we have to add `SwiftNIO`, `SwiftNIOTransportServices` and `SwiftNIOHTTP1` as dependencies to our project. Let's open the `Podfile` and add the following dependencies:

```ruby
  pod 'SwiftNIO', '~> 2.0.0'
  pod 'SwiftNIOTransportServices', '~> 1.0.0'
  pod 'SwiftNIOHTTP1', '~> 2.0.0'
```

After that, run `bundle exec pod install` and wait until the Pods are installed.

Having installed the dependencies we are ready to move to the actual implementation. 

# ChannelHandler

To do the data manipulation, `SwiftNIO` is using the terms `ChannelPipeline`, `ChannelHandler` and `ChannelContext`.

> For a thorough description of what each of these building blocks is, you can refer to the [corresponding documentation](https://github.com/apple/swift-nio#channels-channel-handlers-channel-pipelines-and-channel-contexts).

Long story short, `ChannelHandler` is a base protocol for handlers that handle I/O events or intercept an I/O operation.

[`ChannelHandler`](https://apple.github.io/swift-nio/docs/current/NIO/Protocols/ChannelHandler.html) should not be used directly but rather through its sub-protocols. A ChannelHandler can be Inbound, Outbound or both. The first one refers to handlers which process inbound events like reading data, while the second refers to handlers which process outbound events like writes.

Those handlers are added to a sequence, the `ChannelPipeline`. Then, with each new event, each handler processes the event in order. For read events that order is from the front to the back of the sequence whereas for write events is the reverse order.

Finally, each handler is using `ChannelHandlerContext` to communicate with other handlers by emitting events.

In our case, we are going to create a class that conforms to `ChannelInboundHandler`, and its main responsibility will be to read the data coming from any other previous `ChannelInboundHandler` and prepare the response and the corresponding header which will be forwarded to the next `ChannelHandler` using the `ChannelHandlerContext`.

An example of a dummy `ChannelInboundHandler` is the following: 

```swift
import Foundation
import NIOHTTP1
import NIO

final class DummyHandler: ChannelInboundHandler {
    typealias InboundIn = HTTPServerRequestPart
    typealias OutboundOut = HTTPServerResponsePart

    func channelRead(context: ChannelHandlerContext, data: NIOAny) {
        let part = self.unwrapInboundIn(data)

        guard case .head = part else {
            return
        }

        // Prepare the response body
        let message = ["message": "Hello World"]
        let response = try! JSONEncoder().encode(message)

        // set the headers
        var headers = HTTPHeaders()
        headers.add(name: "Content-Type", value: "application/json")
        headers.add(name: "Content-Length", value: "\(response.count)")

        let responseHead = HTTPResponseHead(version: .init(major: 1, minor: 1), status: .ok, headers: headers)
        context.write(self.wrapOutboundOut(.head(responseHead)), promise: nil)

        // Set the data
        var buffer = context.channel.allocator.buffer(capacity: response.count)
        buffer.writeBytes(response)
        let body = HTTPServerResponsePart.body(.byteBuffer(buffer))
        context.writeAndFlush(self.wrapOutboundOut(body), promise: nil)
    }
}
```

First we declare the `InboundIn` and the `OutboundOut` types. `InboundIn` defines the kind of data that this handler is expecting to receive from any previous `ChannelHandler` whereas `OutboundOut` is the kind of data that will be forwarded to the next.

In our case they are `HTTPServerRequestPart` and `HTTPServerResponsePart` respectively, both of which are typeliases for the generic enum `HTTPPart<HeadT: Equatable, BodyT: Equatable>` that contains three cases; `.head`, `.body` and `.end`.

After that, we provide an implementation for the `channelRead` function which is called when there are some data to be read. The data is passed as a `NIOAny` object, so we have to unwrap it to the `InboundIn` type. Next, we prepare the data that we want as a response. In our case it is a simple map and we use the `JSONEncoder` to encode it into data. 

Then, we set the response headers, which consist of the `Content-Type` and the `Content-Length` headers and using the `context.write` we are sending an event to the next `ChannelHandler` in the `ChannelPipeline`.

Carrying on, we create a buffer with the response data and we set it as the body of the response. We are also calling the `writeAndFlush` function which is sending a `write` event to the next `ChannelHandler` followed by a `flush` event. With the `write` event the body data will be enqueued to be written to the socket when the `flush` event arrives.

Now, let's move to the server that will use this `ChannelHandler`!

# Server

An example of a server that is using the `ChannelHandler` can be found on the following snippet.

```swift
import NIOTransportServices
import NIO

class Server {
    // MARK: - Initializers
    init(host: String, port: Int) {
        self.host = host
        self.port = port
    }
    
    // MARK: - Public functions
    func start() {
        do {
            let bootstrap = NIOTSListenerBootstrap(group: group)
                .childChannelInitializer { channel in
                    channel.pipeline.configureHTTPServerPipeline()
                        .flatMap {
                            channel.pipeline.addHandler(DummyHandler())
                    }
            }
            let channel = try bootstrap
                .bind(host: host, port: port)
                .wait()
            
            try channel.closeFuture.wait()
        } catch {
            print("An error happed \(error.localizedDescription)")
            exit(0)
        }
    }
    
    func stop() {
        do {
            try group.syncShutdownGracefully()
        } catch {
            print("An error happed \(error.localizedDescription)")
            exit(0)
        }
    }
    
    // MARK: - Private properties
    private let group = NIOTSEventLoopGroup()
    private var host: String
    private var port: Int
}
```

In this class, we define an initializer with a `host` and `port` variable and two functions; `start` and `stop` which are, as you can imagine, responsible to start and stop the server. 

Let's focus on the `start` function first. 

Initially, we have to bootstrap our channel. We are using the `NIOTSListenerBootstrap` to do so and its `childChannelInitializer` function to add ChannelHandlers to the ChannelPipeline. To add HTTP-server capabilities to our server, we call the 
`configureHTTPServerPipeline` which adds some HTTP-related ChannelHandlers to the ChannelPipeline. After that, we are using flatMap to add our own `DummyHandler` to the `ChannelPipeline`. We are, then, using this bootstrap to bind our channel to the port and the host set through the initializer and finally, we are using `try channel.closeFuture.wait()` to make our server run until we decide to close it.

As for the `stop` function, we just call `try group.syncShutdownGracefully()` to shut down the `EventLoopGroup` gracefully.

# Results

The last missing piece to run our server is to initialize a server instance and call the `start` function, like in the following lines:

```swift
let app = Server(host: "localhost", port: 8888)
app.start()
```

And we are ready to run the app!

Now, if you head to the Terminal and execute the command `curl -X GET http://localhost:8888` (requires to have `curl` installed) or use a browser either on the device or the emulator that you use to run the app, and you visit `http://localhost:8888`, you will receive the `{"message":"Hello World"}` response.

## Conclusion

To sum up, in this post, we have seen how to use `SwiftNIO` in an iOS app to run an HTTP server that will serve a static JSON response. 

But given that SwiftNIO is a low-level framework, in order to reach my goal of building a mock server app, there are a lot of things to be implemented, like a routing implementation that will make it easy to change the response on the fly. 

For this reason, as alternatives to SwiftNIO, there are also some other high-level framework that you can also use to run a server on an iOS app, such as [GCDWebServer](https://github.com/swisspol/GCDWebServer), [swifter](https://github.com/httpswift/swifter), [Ambassador](https://github.com/envoy/Ambassador) and [Kitura](https://github.com/IBM-Swift/Kitura-Mobile-Server).

SwiftNIO or not, knowing that it is possible to run a server in an iOS app is something that could be useful in many ways!!

Thanks for reading and should you have any questions, suggestions or comments, just let me know on [Twitter](https://twitter.com/diamantidis_io) or [email me](mailto:diamantidis@outlook.com)!!
