---
layout: tips
title: Turn your browser into an WYSIWYG editor with document designMode
description: A post on how to make the entire webpage editable  using document designMode
date: 2020-07-03 06:00 +0200
tags: [Web]
---

> TLDR; 
> <br> Open the browser's Javascript console,
> <br> Execute `document.designMode = 'on';`,
> <br> Click on any text in the screen and start typing!

Isn't it crazy!  :nerd_face:

[designMode] is a not so well known feature that allows us to make the entire webpage editable.
By default, its value is `off`, but once we set the value to `on`, it makes the entire page editable and allows us to change the content as we wish.

If you want to disable it, you simply set its value back to `off` (`document.designMode = 'off';`).

It's also worth mentioning that the vast majority of modern browsers support this feature.

Hope you find this little tip helpful! :rocket:

[designMode]: https://developer.mozilla.org/en-US/docs/Web/API/Document/designMode
