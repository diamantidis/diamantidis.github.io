---
layout: page
title: Tags
permalink: /tags
---


{%- capture site_tags -%}
  {%- for tag in site.tags -%}
    {{ tag | first }}{% unless forloop.last %},{%- endunless -%}
  {% endfor %}
{%- endcapture -%}

{% assign tag_words = site_tags | split: ',' | sort %}

<!-- Build the Page -->

<div class="page-tags">
  {% for item in (0..site.tags.size) %}{% unless forloop.last %}
  {% assign tag = tag_words[item] %}  
    <a class="page-tag" href="/tags#{{ tag | cgi_escape }}">{{ tag }} ({{ site.tags[tag].size }}) </a>
  {% endunless %}{% endfor %}
</div>


<!-- Posts by Tag -->
<div>
  {% for item in (0..site.tags.size) %}{% unless forloop.last %}
    {% capture this_word %}{{ tag_words[item] }}{% endcapture %}
    <div class="tag-content">
      <h2 id="{{ this_word | cgi_escape }}" class="tag-title">{{ this_word }}</h2>
      {% for post in site.tags[this_word] %}{% if post.title != null %}
        <div class="tags-post">
            <a class="post-link" href="{{ post.url | relative_url }}">
              {{ post.title | escape }}
            </a>
            {% assign page_content = post %}
            {% include post-subheader.html %}
        </div>
      {% endif %}{% endfor %}
    </div>
  {% endunless %}{% endfor %}
</div>