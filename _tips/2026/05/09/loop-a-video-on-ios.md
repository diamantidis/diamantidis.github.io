---
layout: tips
title: "How to loop a video on iOS"
description: Learn how to loop a video in an iOS app using AVQueuePlayer and AVPlayerLooper in SwiftUI
date: 2026-05-09 06:00 +0200
tags: [iOS, Swift, AVKit]
image:
    path: /assets/social/tips/loop-in-video.png
    width: 1018
    height: 512
twitter:
    card: summary_large_image
---

When displaying videos in an iOS app, you may sometimes need them to loop continuously. Think of a workout app where a trainer demonstrates an exercise. For this kind of use case, [`AVQueuePlayer`] and [`AVPlayerLooper`] are the go-to tools.

The approach is straightforward: create an `AVQueuePlayer`, wrap it in an `AVPlayerLooper` with the video as an `AVPlayerItem`, and use this player on an `AVPlayerViewController` instead of a regular `AVPlayer`. Since the looper needs to stay alive for the loop to work, we retain it in a `Coordinator` - without it, the looper gets deallocated and the loop stops.

A working example looks like this:

```swift
struct LoopingVideoView: UIViewControllerRepresentable {
    let videoName: String

    func makeUIViewController(context: Context) -> AVPlayerViewController {
        let controller = AVPlayerViewController()

        guard let url = Bundle.main.url(forResource: videoName, withExtension: "mp4") else {
            return controller
        }

        let item = AVPlayerItem(url: url)
        let player = AVQueuePlayer()

        context.coordinator.looper = AVPlayerLooper(
            player: player,
            templateItem: item
        )

        controller.player = player
        player.play()

        return controller
    }

    func updateUIViewController(
        _ uiViewController: AVPlayerViewController,
        context: Context
    ) { }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    class Coordinator {
        var looper: AVPlayerLooper?
    }
}
```

Usage:

```swift
LoopingVideoView(videoName: "video")
    .frame(height: 200)
```

The video will replay automatically when it reaches its end.


Thanks for reading! If you found this tip useful, consider [buying me a coffee] to support the blog. For questions or comments, feel free to reach out on [X]!

Until next time!

[`AVQueuePlayer`]: https://developer.apple.com/documentation/avfoundation/avqueueplayer
[`AVPlayerLooper`]: https://developer.apple.com/documentation/avfoundation/avplayerlooper
[buying me a coffee]: https://www.buymeacoffee.com/diamantidis
[X]: https://x.com/diamantidis_io
