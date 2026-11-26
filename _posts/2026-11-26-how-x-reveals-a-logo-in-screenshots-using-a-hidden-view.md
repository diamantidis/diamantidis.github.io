---
layout: post
title: How X (formerly Twitter) reveals a logo in screenshots using a hidden view
description: "A look at how X shows a different view in screenshots than on screen, by hiding content behind a secure text field"
date: 2026-11-26 11:00 +0200
tags: [iOS, UIKit, Swift]
twitter:
    card: summary_large_image
---

Recently I noticed something odd while taking screenshots in the X app. On screen, a tweet header shows a Follow button in the top-right corner. In the screenshot, that same spot shows the X logo instead. The change happens at the exact moment iOS captures the image, and there is no screenshot notification handler involved.

This post explains how that trick works and how you can reproduce it with a small amount of UIKit code.

> **Placeholder image:** side-by-side view showing the in-app Follow button on the left and the screenshot revealing the X logo in the same spot on the right.

## The iOS mechanism behind it

iOS has a built-in behavior for sensitive input: a `UITextField` with `isSecureTextEntry` set to `true` is meant for passwords and similar secrets. As part of that protection, iOS strips the rendering of that field from screenshots and screen recordings. The field stays visible while using the app, but its content is blanked in any captured image.

That behavior is not limited to text. The whole rendering canvas of a secure text field is removed during capture. So if you place a view inside such a field, that view disappears from the screenshot too.

## Hiding one view behind another

The trick builds on that behavior with two layers:

1. A logo view is placed at the back.
2. A secure text field is placed on top of it, and the normal on-screen view (for example the Follow button) is added as a subview of that field.

While using the app, the secure field renders normally and you see the button. When a screenshot is taken, iOS clears the secure field's layer, revealing the logo that was behind it.

The app does not detect the screenshot or redraw anything at the last moment. The logo is in the view hierarchy the whole time.

## Minimal reproducible example

The following UIKit snippet reproduces the effect. Place it in a view controller and take a screenshot to see the logo appear.

```swift
import UIKit

final class ScreenshotLogoView: UIView {
    private let logoView = UIImageView()
    private let secureField = UITextField()

    override init(frame: CGRect) {
        super.init(frame: frame)

        // Logo that is only visible in screenshots
        logoView.image = UIImage(systemName: "xmark.circle.fill")
        logoView.contentMode = .scaleAspectFit
        logoView.tintColor = .label
        addSubview(logoView)

        // Secure field overlays the logo. Its content is stripped on capture.
        secureField.isSecureTextEntry = true
        secureField.isUserInteractionEnabled = false
        secureField.borderStyle = .none
        secureField.backgroundColor = .clear

        let followButton = UIButton(type: .system)
        followButton.setTitle("Follow", for: .normal)
        followButton.frame = CGRect(x: 0, y: 0, width: 90, height: 32)
        secureField.addSubview(followButton)

        addSubview(secureField)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        logoView.frame = bounds
        secureField.frame = bounds
        secureField.subviews.first?.center = secureField.center
    }
}
```

To try it, present the view and take a screenshot with the side button and volume button. The screenshot shows the logo where the button was.

## Caveats

A few things to keep in mind:

- This relies on undocumented behavior of secure text fields. Apple may change it in a future iOS release.
- The trick depends on the secure field being on screen at the exact moment of capture. An app switcher snapshot, for example, is often taken from a frozen frame and may still show the foreground view.
- On Android there is no direct equivalent through this mechanism; apps use other approaches there.
- Because secure fields are involved, iOS may treat the screen as a password entry surface in some contexts.

## Conclusion

What looks like a clever screenshot-only branding trick turns out to be a reuse of a privacy feature meant to protect passwords. By layering a logo behind a secure text field, X keeps its normal UI clean while still leaving a mark on every screenshot.

Thanks for reading! If you found this post useful, consider [buying me a coffee] to support the blog. For questions or comments, feel free to reach out on [X]!

Until next time!

[buying me a coffee]: https://www.buymeacoffee.com/diamantidis
[X]: https://x.com/diamantidis_io