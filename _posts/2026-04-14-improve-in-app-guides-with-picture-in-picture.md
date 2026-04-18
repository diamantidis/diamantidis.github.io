---
layout: post
title: Improve In App Video Guides with Picture-in-Picture in SwiftUI
description: "A post exploring how to add Picture-in-Picture support to video players in SwiftUI for better user experience in onboarding flows"
date: 2026-04-18 11:00 +0200
tags: [Swift, SwiftUI, iOS, AVKit, AVFoundation]
image:
    path: /assets/social/pip-swiftui.png
    width: 910
    height: 512
twitter:
    card: summary_large_image
---


When we build features like widgets or Safari extensions in our app, short video guides can help our users follow the setup steps that must be performed outside of the app.

### The SwiftUI VideoPlayer
For this kind of content, SwiftUI provides a built-in `VideoPlayer` that makes it straightforward to play videos. With just a few lines of code, we can add a fully functional video player in a SwiftUI view.

```swift
import SwiftUI
import AVKit

struct TutorialVideoView: View {
    let player: AVPlayer = {
        guard let url = Bundle.module.url(forResource: "widget", withExtension: "mp4") else {
            fatalError("widget.mp4 not found")
        }
        return AVPlayer(url: url)
    }()

    var body: some View {
        VideoPlayer(player: player)
            .frame(height: 200)
    }
}
```

This works well for basic playback, but it falls short for guided onboarding flows. As soon as users leave the app to follow the instructions, the video goes into the background as well. That forces them to return to the app, resume the video, watch the next step, and repeat the same cycle.

Thankfully, there is a solution to this problem: Picture-In-Picture. 

## The Solution: AVPlayerViewController with Picture-in-Picture

To enable Picture-in-Picture (PiP) support, we'll use an `AVPlayerViewController`, and we'll wrap it in a `UIViewControllerRepresentable` so that we can use it from SwiftUI.

Here is the implementation:

```swift
import SwiftUI
import AVKit

struct PiPVideoPlayer: UIViewControllerRepresentable {
    let player: AVPlayer

    func makeUIViewController(context: Context) -> AVPlayerViewController {
        let controller = AVPlayerViewController()
        controller.player = player
        controller.allowsPictureInPicturePlayback = true
        controller.canStartPictureInPictureAutomaticallyFromInline = true
        return controller
    }

    func updateUIViewController(_ uiViewController: AVPlayerViewController, context: Context) {
        uiViewController.player = player
    }
}
```

In this snippet, we configure two key properties on the `AVPlayerViewController`:

- **allowsPictureInPicturePlayback**: Enables PiP support on the player. Without this, the PiP button won't appear at all.
- **canStartPictureInPictureAutomaticallyFromInline**: Allows PiP to activate automatically when the user navigates away from the app while the video is playing inline (not fullscreen). This is key for our use case — users don't need to manually enable PiP.

Then in our view, we create the player and pass it in:

```swift
struct TutorialVideoView: View {
    let player: AVPlayer = {
        guard let url = Bundle.module.url(forResource: "widget", withExtension: "mp4") else {
            fatalError("widget.mp4 not found")
        }
        return AVPlayer(url: url)
    }()

    var body: some View {
        PiPVideoPlayer(player: player)
            .frame(height: 200)
    }
}
```

With this implementation, the system provides a PiP button in the playback controls. Once activated, users can continue watching the video while navigating to system settings or other apps.

### Prerequisites

Before using this implementation, ensure your project meets these requirements:

1. **Minimum iOS version**: iOS 15 or later
2. **Background Modes**: Enable "Audio, AirPlay, and Picture in Picture" in your app's capabilities.

## Tracking Picture-in-Picture Events

To take it a step further, you can implement the delegate methods provided by `AVPlayerViewController` to understand how users interact with your onboarding videos. Just create a coordinator that conforms to `AVPlayerViewControllerDelegate`:

```swift
import AVKit
import os.log

class VideoPlayerCoordinator: NSObject, AVPlayerViewControllerDelegate {
    private let logger = Logger(subsystem: "com.yourapp.video", category: "PiP")

    func playerViewControllerWillStartPictureInPicture(_ playerViewController: AVPlayerViewController) {
        logger.info("PiP will start")
    }

    func playerViewControllerDidStartPictureInPicture(_ playerViewController: AVPlayerViewController) {
        logger.info("PiP started")
    }

    func playerViewController(_ playerViewController: AVPlayerViewController, failedToStartPictureInPictureWithError error: Error) {
        logger.error("PiP failed to start: \(error.localizedDescription)")
    }

    func playerViewControllerWillStopPictureInPicture(_ playerViewController: AVPlayerViewController) {
        logger.info("PiP will stop")
    }

    func playerViewControllerDidStopPictureInPicture(_ playerViewController: AVPlayerViewController) {
        logger.info("PiP stopped")
    }

    func playerViewController(_ playerViewController: AVPlayerViewController, restoreUserInterfaceForPictureInPictureStopWithCompletionHandler completionHandler: @escaping (Bool) -> Void) {
        logger.info("Restoring UI for PiP stop")
        completionHandler(true)
    }
}
```

To use this coordinator, update the `PiPVideoPlayer` to include it:

```swift
struct PiPVideoPlayer: UIViewControllerRepresentable {
    let player: AVPlayer

    func makeCoordinator() -> VideoPlayerCoordinator {
        VideoPlayerCoordinator()
    }

    func makeUIViewController(context: Context) -> AVPlayerViewController {
        let controller = AVPlayerViewController()
        controller.player = player
        controller.delegate = context.coordinator
        controller.allowsPictureInPicturePlayback = true
        controller.canStartPictureInPictureAutomaticallyFromInline = true
        return controller
    }

    func updateUIViewController(_ uiViewController: AVPlayerViewController, context: Context) {
        uiViewController.player = player
    }
}
```

With these delegate methods in place, you can now track when users start or stop PiP and identify failures.

## Conclusion

To sum up, the built-in SwiftUI `VideoPlayer` is convenient for simple use cases, but it's insufficient for onboarding flows where users must leave the app to complete setup. With Picture-in-Picture, they can keep the tutorial visible while performing the actual setup steps, resulting in a much smoother onboarding experience.

Thanks for reading! If you found this post useful, consider [buying me a coffee] to support the blog. For questions or comments, feel free to reach out on [X]!

Until next time!

[buying me a coffee]: https://www.buymeacoffee.com/diamantidis
[X]: https://x.com/diamantidis_io
