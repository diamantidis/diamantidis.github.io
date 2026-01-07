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

<div class="mb-8">
  {% for item in (0..tag_words.size) %}{% unless forloop.last %}
  {% assign tag = tag_words[item] %}
  {% assign tip_tag = grouped_tip_tags | where:"name", tag | first %}
    <a class="inline-block px-4 py-1 mb-1 mr-2 whitespace-nowrap bg-[var(--base-color)] text-[var(--tag-color)] rounded-xl text-xs align-middle tracking-[1.3px] hover:bg-[var(--hover-color)]" href="/tags#{{ tag | cgi_escape }}">{{ tag }} ({{ site.tags[tag].size | plus: tip_tag.size }})  </a>
  {% endunless %}{% endfor %}
</div>


<!-- Posts by Tag -->
<div>
  {% for item in (0..tag_words.size) %}{% unless forloop.last %}
    {% capture this_word %}{{ tag_words[item] }}{% endcapture %}
    <div class="tag-content">
      <h2 id="{{ this_word | cgi_escape }}" class="text-[var(--title-color)] font-bold text-3xl leading-tight">{{ this_word }}</h2>
      {% for post in site.tags[this_word] %}{% if post.title != null %}
        <div class="mt-5 mb-2 border border-[var(--border-color)] rounded-xl p-3">
            <div class="py-1 overflow-auto inline-block w-full p-0">
              <span class="text-xs text-[var(--metatext-color)] uppercase align-middle"><i class="fa fa-file-text-o mr-2" style="font-family: FontAwesome; font-style: normal; font-weight: normal; text-decoration: inherit;"></i>Post</span>
            </div>
            <a class="post-link text-3xl" href="{{ post.url | relative_url }}">
              {{ post.title | escape }}
            </a>
            {% assign page_content = post %}
            {% include post-subheader.html %}
        </div>
      {% endif %}{% endfor %}
      {% for tip in site.tips %}
        {% if tip.tags contains this_word %}
          <div class="mt-5 mb-2 border border-[var(--border-color)] rounded-xl p-3">
            <div class="py-1 overflow-auto inline-block w-full p-0">
              <span class="text-xs text-[var(--metatext-color)] uppercase align-middle"><i class="fa fa-lightbulb-o mr-2" style="font-family: FontAwesome; font-style: normal; font-weight: normal; text-decoration: inherit;"></i>Tip</span>
            </div>
            <a class="post-link text-3xl" href="{{ tip.url | relative_url }}">
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