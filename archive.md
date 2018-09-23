---
layout: page
title: Archive
permalink: /archive
---

{% assign posts_by_year = site.posts | group_by_exp:"post", "post.date | date: '%Y'" %}


{% for year in posts_by_year %}
  <div class="archive-content">
    <h2 class="archive-year">{{ year.name }}</h2>
    <div class="archive-year-content">
      {% assign posts_by_month = year.items | group_by_exp:"post", "post.date | date: '%B'" %}
      {% for month in posts_by_month %}
        <h4 class="archive-month">{{ month.name }}</h4>
        <div class="archive-month-content">
            {% for post in month.items %}
               <div class="archive-post">
                  <a class="post-link" href="{{ post.url | relative_url }}">
                    {{ post.title | escape }}
                  </a>
                <div class="post-meta">
                  <span class="post-date">
                    {{ post.date | date: "%B %-d, %Y" }}
                  </span>
                  <span class="post-divider">-</span>
                  <span class="post-minutes">
                    {% capture words %}
                      {{ post.content | number_of_words }}
                    {% endcapture %}
                    {% unless words contains "-" %}
                      {{ words | plus: 250 | divided_by: 250 | append: " minute read" }}
                    {% endunless %}
                  </span>
                  <span class="post-divider">-</span>
                  <div class="post-tags">
                    {% for tag in post.tags %}
                      <a class="post-tag" href="/tags#{{ tag }}">{{ tag }}</a>
                    {% endfor %}
                  </div>
                </div>
              </div>
            {% endfor %}
        </div>
      {% endfor %}
    </div>
  </div>
{% endfor %}
