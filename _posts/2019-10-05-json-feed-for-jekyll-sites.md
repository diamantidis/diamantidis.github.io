---
layout: post
title: JSON feed for Jekyll sites
description: A post about feeds, JSON feed and how to add in on a Jekyll site
date: 2019-10-05 06:00 +0200
comments: true
tags: [Jekyll, "JSON feed"]
---

Feed is a term used to usually describe a text file that provides information about the content of a website and it is primarily intended to be used for data exchange purposes. 

By following some specific schema specifications about the format of the file, a feed can be used by other apps or tools, which will read the content of a website, store it and if there is for example an update, they will notify the user about the new content. 

There are plenty such schema specifications and the most popular are [Atom](https://tools.ietf.org/html/rfc4287) and [RSS](http://www.faqs.org/rfcs/rfc3339.html) which both are using an XML-based format. But since JSON is the most prominent data format amongst developers, new options emerge, like the [JSON feed](https://jsonfeed.org/).

Since the launch of this blog, a plugin named [jekyll-feed](https://github.com/jekyll/jekyll-feed) is used to generate an Atom feed, which is still [in place]({{ "feed.xml" | absolute_url }}) till now. 

So, why do I need a JSON feed if I already have an Atom one?

## But why?

First and foremost, it doesn't hurt to support yet another format that may be used by some readers. 

Furthermore, on top of what I previously mentioned about the popularity of JSON compared to XML, JSON files are easier to read, write, and also when it comes to developing an application that will have to parse a JSON. In most programming languages, it's just a matter of a few lines of code. As a result, having a JSON-formatted feed will allow me to implement more interesting stuff in the future based on this feed.

Recently, I have been exploring the potential of Kotlin Native. So far, my main focus was on the fundamentals and the whole process have been recorded in [a series of posts]({{"tags#KMP" | absolute_url }}). And now, time has come to try it out on a more real-world use case that will help be to get better insights on the benefits and the shortcomings of Kotlin Native. 

After a lot of consideration, I ended up choosing to build a feed reader for this site. Implementing such a project will give me the opportunity to use a shared library for features like networking, data de-serialization, storing user preferences and much more yet to be found. 

To be honest, the existing Atom feed could also have be used, but the lack of options for parsing an XML from a Kotlin Native library and the fact that [KotlinX serialization](https://github.com/Kotlin/kotlinx.serialization) makes it a breeze to de-serialize a JSON string, make it a no-brainer for me!

So, that's more or less my thought process and how I decided to add a JSON Feed on this blog, and now, it's time to move on to the actual implementation!

## Implementation

First thing first, let's take a look at [the specifications of the JSON Feed](https://jsonfeed.org/version/1).
Based on that, the implementation of JSON feed for a Jekyll site is fairly simple. It just requires adding a file named `feed.json` on the root folder of your project with the following content:

{% highlight ruby %}
{% raw %}
---
layout: null
permalink: feed.json
---

{
    "version": "https://jsonfeed.org/version/1",
    "title": "{{ site.title }}",
    "home_page_url": "{{ site.url }}",
    "feed_url": "{{ site.url }}/feed.json",
    "description": "{{ site.description }}",
    "icon": "{{ site.url }}{{ site.logo }}",
    "favicon": "{{ site.url }}/favicon.ico",
    "expired": false,
    "author": {
        "name": "{{ site.author.name }}",
        "url": "{{ site.url }}"
    },
    "items": [
        {% for post in site.posts %}
        {
            "id": "{{ post.url | absolute_url | sha1 }}",
            "url": "{{ site.url }}{{ post.url }}",
            "title": {{ post.title | jsonify }},
            "date_published": "{{ post.date | date_to_xmlschema }}",
            {% if post.date-updated %}
            "date_modified": "{{ post.date-updated | date_to_xmlschema }}",
            {% else %}
            "date_modified": "{{ post.date | date_to_xmlschema }}",
            {% endif %}
            "author": {
                "name": "{{ site.author.name }}",
                "url": "{{ site.url }}"
            },
            "summary": {{ post.excerpt | jsonify }},
            "content_html": {{ post.content | jsonify }},
            "tags": {{ post.tags | jsonify }},
            "image": "{{ post.image | absolute_url }}"
        }{% if forloop.last == false %},{% endif %}
        {% endfor %}
    ]
}
{% endraw %}
{% endhighlight %}


In the snippet above, we make use of Jekyll's global variable `site` to retrieve site-wide information and configuration. To render the posts, we iterate over the posts that we get from the `site` variable and apply some [Liquid filters](https://jekyllrb.com/docs/liquid/filters/) to format the content.

And, that's all!

If you try to run `bundle exec jekyll build` and navigate to the `_site` directory, you will be able to find a new file named `feed.json` that will contain a JSON-formatted feed, similar to the [one created for this site]({{ "feed.json" | absolute_url }}).

## Conclusion

To sum up, in this post we have seen how easy it is to add support for JSON feed on a Jekyll site. 

Now, all you have to do is to find a feed reader app and use either the [Atom]({{ "feed.xml" | absolute_url }}) or the [JSON]({{ "feed.json" | absolute_url }}) feed to get notified when some new post is published! :smile:

In the meantime, I will be able to focus on to the actual implementation of my feed reader using Kotlin Native!

Thanks for reading, I hope that you found this post useful and should you have any suggestions on any other questions or comments, just let me know on [Twitter](https://twitter.com/diamantidis_io) or by [email](mailto:diamantidis@outlook.com)!
