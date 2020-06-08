---
layout: tips
title: Working with drafts on a Jekyll blog
description: "How to create and serve drafts when working on a blog built with Jekyll"
date: 2020-06-08 06:00 +0200
tags: [Jekyll]
image:
    path: /assets/social/tips/working-with-drafts-on-a-jekyll-blog.png
    width: 825
    height: 512
twitter:
    card: summary_large_image
---

Did you know that Jekyll supports drafts by default?

The process of writing a post may span to multiple days; from ideation to writing the post, polishing and eventually publishing.

Instead of creating a post, you can start using drafts for those unfinished posts that you don't want to publish yet.

To start using drafts on an existing Jekyll blog, just follow the following steps:

```sh
# Create a folder named `_draft` on the root directory of your blog 
mkdir _drafts
# Inside '_draft', create a Markdown file for your first draft
touch _drafts/my-first-draft.md
# Open this file and add some content
echo "my first draft" > _drafts/my-first-draft.md
#  Run your blog with the `--drafts` switch
jekyll server --watch --drafts
# Open http://127.0.0.1:4000 on your favourite browser to see the draft
```
And that's it!

You can now start writing your posts using drafts! :rocket:
