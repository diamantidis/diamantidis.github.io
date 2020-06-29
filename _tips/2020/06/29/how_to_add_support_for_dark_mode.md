---
layout: tips
title: How to add support for dark mode on a website
description: How to add support for dark mode using CSS variables and media queries
date: 2020-06-29 06:00 +0200
tags: ["CSS"]
image:
    path: /assets/social/tips/how_to_add_support_for_dark_mode.png
    width: 800
    height: 419
twitter:
    card: summary_large_image
---


In recent years, dark mode has grown in popularity as more and more devices and browsers are adding support for it.

Those reasons make it a great little feature that we can add on our websites to improve the experience of the users who prefer to use dark mode.


Let's see how we can support this feature in 3 steps!


First, we will take advantage of another great CSS feature: [CSS variables]({{ "/tips/2020/06/17/css-variables" | absolute_url }})



On the `:root` level, we will define two variables; one with the color of the background and one with the color of the text.
```css
:root {
    --background-color: #FFF;
    --text-color: #000;
}
```

Then, we will define a `prefers-color-scheme` media query for the dark color theme. In this media query, we will override the values of the variables that we defined in the previous step.


```css
@media (prefers-color-scheme: dark) {
    :root {
        --background-color: #000;
        --text-color: #FFF;
    }
}
```

Lastly, we will use those variables to assign their values to CSS properties. In our case, we will use the variable to set the background and the color of the body.

```css
body {
    background: var(--background-color);
    color: var(--text-color);
}
```

Now all you have to do is to find a color palette for the dark theme and apply it following those steps!

