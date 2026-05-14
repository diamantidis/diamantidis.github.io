---
layout: page
title: Archive
description: Browse all blog posts organized by year and month.
permalink: /archive
---

{% assign posts_by_year = site.posts | group_by_exp:"post", "post.date | date: '%Y'" %}


{% for year in posts_by_year %}
  <div>
    <h2 class="text-(--title-color) font-bold text-3xl leading-tight">{{ year.name }}</h2>
    <div class="pl-6 my-2">
      {% assign posts_by_month = year.items | group_by_exp:"post", "post.date | date: '%B'" %}
      {% for month in posts_by_month %}
        <h4 class="text-(--title-color) font-bold text-xl">{{ month.name }}</h4>
        <div class="pl-6 my-2">
            {% for post in month.items %}
              {% include card.html item=post type="post" %}
            {% endfor %}
        </div>
      {% endfor %}
    </div>
  </div>
{% endfor %}
