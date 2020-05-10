---
layout: post
title: How to add a shield on the App Icon of beta builds
description: A post describing how to change the App Icon of an iOS app and add shield with the configuration and the version of the build
date: 2020-05-10 06:00 +0200
comments: true
tags: [iOS, badge, fastlane]
---

Have you ever ended up in a situation where you have multiple builds of the same app installed on a device and you find it hard to figure out the configuration and the version of each build? Wouldn't it be great if we could make it easier to identify which one is which with a single glance?

![App Icons before screenshot]({{site.url}}/assets/shield_on_app_icon/app_icons_before.png)

The good news is that, with a little imagination, we can find multiple alternatives to ease this issue. For example, we could add this info on the app name, present it somewhere inside the app, use a settings bundle to show it in the app settings or use a different app icon. 

Among all these options, I personally believe that the most efficient, when using the app, is to change the app icon. Wouldn't it make it much easier to recognize them if we were to add a shield on the app icon with information about the configuration and the version for dev or stage builds?

![App Icons after screenshot]({{site.url}}/assets/shield_on_app_icon/app_icons_after.png)

In this post, we are going to see how we can use a Ruby gem name [`badge`] to add this shield on the app icon. Let's get started!

## badge gem

As I mentioned before, [`badge`] is a Ruby gem that makes it easy to add a shield or a badge on the app icon. It also offers the option to either use it directly from the command like or from fastlane's Fastfile.

> **Note**: As an alternative to this gem, you can use [ImageMagick]. `badge` itself is using `ImageMagick` but it restricts you to a specific style for the shield. If you prefer to create something custom, then `ImageMagick` is the way to go, as it allows for more freedom and creativity in regards to the position and the style of the shield.

Let's first see how we can use it from the `Fastfile`!

## The fastlane way

> **Note**: I make the assumption that you already have `Bundler` and `fastlane` setup. If not, you can refer to my previous posts and find out how you can setup both [Bundler]({%post_url 2020-04-26-setting-up-an-ios-project-part-i %}#bundler) and [fastlane]({%post_url 2020-05-03-setting-up-an-ios-project-part-ii %}#fastlane) on an iOS project.

To begin with, there is a fastlane plugin for `badge`. To install it, we will run the command `bundle exec fastlane add_plugin badge` on the root directory of the project.

When this command is completed, we can open the `fastlane/Fastfile` and add a new lane to add the shield on the app icon. This lane will look like the following snippet.


```ruby
APP_PROJECT = "<YourApp>.xcodeproj"

desc "Add a shield on the App Icon"
lane :add_shield do |options|
  puts options
  version = get_version_number(xcodeproj: APP_PROJECT)
  if options[:config] == "dev"
    add_badge(
      shield: "Dev-#{version}-green",
      no_badge: true
    )
  elsif options[:config] == "staging"
    add_badge(
      shield: "Stag-#{version}-orange",
      no_badge: true
    )
  end
end
```

In this lane, we first create a variable with the version of the app and then we run the `add_badge` action but with different text and color for each configuration.

Once ready, you can either run the command directly from the terminal, like `bundle exec fastlane add_shield config:dev` or use it from another lane, for example from the dev or stage build lane, like so: `add_shield(config: dev)`.

## The Xcode Way

Alternatively, you can add a `Run Script Phase` on the Xcode project and update the icon every time you build the app.

To accomplish this, we will have to follow a different approach. We will have to install the `badge` gem globally on our machine so that we can have access to it from the `Run Script Phase`. To install the gem globally, you can run `sudo /usr/bin/gem install badge`.

Now, we can go to the `Build Phases` tab of our app's target and use the `+` sign to add a `New Run Script Phase`. Drag this phase just before the `Compile Sources` phase and use the following snippet as a content:

```sh
if hash badge 2>/dev/null; then
    version="${MARKETING_VERSION}"
    config="${CONFIGURATION}"

    if [[ $config =~ "Debug" ]]; then
        shield="Dev-${version}-green"
    elif [[ ${config} =~ "Stag" ]]; then
        shield="Stag-${version}-orange"
    fi

    if [ -n "${shield}" ]; then
      echo "Addding shield '${shield}' on the AppIcon"
      badge --shield "${shield}" --no_badge
    fi
else
    echo "warning: 'badge' is not installed, run 'sudo /usr/bin/gem install badge'"
fi
```

In the snippet above, we first check if the `badge` command is available or else we print a warning. 

Then we get the configuration and the version of the build, and, in the same fashion as in the `Fastfile`, we apply the different texts and colors according to those values.

Now if you build the app, you will be able to see a different icon for different configurations and versions. :tada:

But we are not done yet, there is one last thing! As part of this process, we are changing the `AppIcon` but we never revert it back to the original state.

To fix that, we will have to add a `Run Script Phase` that will revert the changes. For this phase, make sure that is the last build phase and use the following as a content: 

```sh
if [[ "${CONFIGURATION}" =~ "Debug" ]] || [[ "${CONFIGURATION}" =~ "Stag" ]]; then
    git checkout -- `git diff --name-only | grep AppIcon.appiconset`
fi
```
> **Note**: Despite the fact that the outcome looks nice, please note that this approach will further slow down the build time on every build. So, I would recommend using it only if it's necessary.

And that's about it! 

## Conclusion

In this post we have seen how we can use the `badge` gem to add a shield on the app icon both when creating a new build from `fastlane` and when building the app from `Xcode`.

In my experience, this comes really handy when distributing beta builds as it makes it much easier to recognize with a single glance the configuration and the version of the build.

Thanks for reading this post, I hope you find it useful!

If you would like to get notified when new posts come out or you want to share a question or commend about this post, feel free to follow me on [Twitter].

[`badge`]: https://github.com/HazAT/badge
[ImageMagick]: https://imagemagick.org/index.php
[Twitter]: https://twitter.com/diamantidis_io