---
layout: tips
title: Improve the accessibility of your website using the aria-label attribute
description: How to use the aria-label attribute to improve the accessibility of a website
date: 2020-06-27 06:00 +0200
tags: ["Accessibility"]
---

With the ever-growing number of services offering their products solely through digital channels, digital accessibility is becoming more and more important.

The lack of accessibility may lead to the exclusion of people with disabilities from those services.
That's why we should all care and make our digital services more and more accessible.

When it comes to the web, we can start with small steps and slowly make a website more and more accessible.

For instance, we can start by using the `aria-label` attribute to add a description on elements that don't have a text label visible on the screen. 

Let's see an example...

It's quite common, when we have a link to a social media account, to use the logo of the social media platform instead of the actual name. To make those links more accessible, you can add the `aria-label` on the anchor tag leading to the social media account, like in the following snippet:

```html
<a href="https://twitter.com/diamantidis_io" aria-label="Twitter">
 ...
</a>
```

I hope that this post will make you more aware of this topic and motivates you to make your website more accessible!

If you are interested to find potential accessibility issues on your websites, you can use [Lighthouse in Google DevTools] or the [web.dev Measure] tool provided by Google. 

[Lighthouse in Google DevTools]: https://developers.google.com/web/tools/lighthouse#devtools
[web.dev Measure]: https://web.dev/measure/