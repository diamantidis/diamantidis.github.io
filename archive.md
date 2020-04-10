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
                  {% assign page_content = post %}
                  {% include post-subheader.html %}
              </div>
            {% endfor %}
        </div>
      {% endfor %}
    </div>
  </div>
{% endfor %}
