---
layout: page
title: Tags
permalink: /tags
---

{% assign tips_tags =  site.tips | map: 'tags' | uniq %}

{%- capture site_tags -%}
  {%- for tag in site.tags -%}
    {{ tag | first }}{% unless forloop.last %},{%- endunless -%}
  {% endfor %}
{%- endcapture -%}

{% assign post_tags = site_tags | split: ',' | sort %}

{% assign tag_words = post_tags | concat: tips_tags | uniq %}

{% assign grouped_tip_tags = site.tips | map: 'tags' | join: ',' | split: ',' | group_by: tag %}

<div class="page-tags">
  {% for item in (0..tag_words.size) %}{% unless forloop.last %}
  {% assign tag = tag_words[item] %}
  {% assign tip_tag = grouped_tip_tags | where:"name", tag | first %}
    <a class="page-tag" href="/tags#{{ tag | cgi_escape }}">{{ tag }} ({{ site.tags[tag].size | plus: tip_tag.size }})  </a>
  {% endunless %}{% endfor %}
</div>


<!-- Posts by Tag -->
<div>
  {% for item in (0..tag_words.size) %}{% unless forloop.last %}
    {% capture this_word %}{{ tag_words[item] }}{% endcapture %}
    <div class="tag-content">
      <h2 id="{{ this_word | cgi_escape }}" class="tag-title">{{ this_word }}</h2>
      {% for post in site.tags[this_word] %}{% if post.title != null %}
        <div class="tags-post">
            <div class="post-subheader post-type">
              <span>Post</span>
            </div>
            <a class="post-link" href="{{ post.url | relative_url }}">
              {{ post.title | escape }}
            </a>
            {% assign page_content = post %}
            {% include post-subheader.html %}
        </div>
      {% endif %}{% endfor %}

      {% for tip in site.tips %}
        {% if tip.tags contains this_word %}
          <div class="tags-post">
            <div class="post-subheader tip-type">
              <span>Tip</span>
            </div>
            <a class="post-link" href="{{ tip.url | relative_url }}">
              {{ tip.title | escape }}
            </a>
            {% assign page_content = tip %}
            {% include post-subheader.html %}
          </div>
        {% endif %}
      {% endfor %}
    </div>
  {% endunless %}{% endfor %}
</div>