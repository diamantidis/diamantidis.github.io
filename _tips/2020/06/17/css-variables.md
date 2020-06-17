---
layout: tips
title: CSS variables
description: An introduction on how to use CSS variables
date: 2020-06-17 06:00 +0200
tags: [CSS]
image:
    path: /assets/social/tips/css-variables-tip.png
    width: 773
    height: 512
twitter:
    card: summary_large_image
---

Did you know that you can define variables in CSS as well? And not only that, but also [all the major browsers](https://caniuse.com/#feat=css-variables) support this feature.

To declare a CSS variable use the 2-hyphens syntax: `--{name}: {value};`, like in the following example, `--padding: 5px;`. Then, use the function `var()` with the name of the variable inside the parenthesis to assign its value to a CSS property, For example, `padding: var(--padding);`.

A use case where CSS variables can really shine is the responsive design. Let's see an example:

```css
:root {
  --padding: 5px;
}

.some-class {
  padding: var(--padding);
}

@media (min-width: 600px) {
  :root {
    --padding: 30px;
  }
}
```

In this example, we create a variable for the padding with value `5px` and we use it to add the padding to the elements with class `some-class`. 
Then, we define a media query for the screen with width larger than `600px`. Inside this media query, instead of writing a new rule for the class `some-class`, we override the value of the variable. 

Besides that, CSS variables can help in various other cases, such as defining multiple color themes,
and using them will eventually result in shorter and much easier to maintain CSS files! :smirk: