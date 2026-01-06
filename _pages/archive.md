---
layout: page
title: Archive
permalink: /archive
---

{% assign posts_by_year = site.posts | group_by_exp:"post", "post.date | date: '%Y'" %}


{% for year in posts_by_year %}
  <div>
    <h2 class="text-[var(--title-color)] font-bold text-3xl leading-tight">{{ year.name }}</h2>
    <div class="pl-6 my-2">
      {% assign posts_by_month = year.items | group_by_exp:"post", "post.date | date: '%B'" %}
      {% for month in posts_by_month %}
        <h4 class="text-[var(--title-color)] font-bold text-xl">{{ month.name }}</h4>
        <div class="pl-6 my-2">
            {% for post in month.items %}
               <div class="mt-5 border border-[var(--border-color)] rounded-2xl p-3">
                  <a class="post-link text-3xl tracking-tight" href="{{ post.url | relative_url }}">
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
