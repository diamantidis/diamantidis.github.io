---
layout: page
title: Tips
description: A collection of short tips and tricks about software development.
permalink: /tips
pagination: 
  enabled: true
  collection: tips
  permalink: /:num/
  sort_field: 'date'
  sort_reverse: true
  title: "Tips"
  per_page: 10
---

<div>
  {%- if paginator.total_pages > 0 -%}
    <ul class="grid grid-cols-2 gap-x-12 gap-y-4 max-sm:grid-cols-1">
      {%- for post in paginator.posts -%}
      <li class="block border border-(--border-color) rounded-3xl p-3 bg-(--tips-card-background-color) shadow-[4px_4px_10px_5px_var(--tips-card-shadow-color)] grid grid-rows-[max-content_max-content_max-content_auto_max-content] grid-gap-0">
        {% assign page_content = post %}
        {% include tips-subheader.html %}
        <h2 class="mb-0 m-0">
          <a class="text-(--text-color) font-bold text-xl m-0 leading-tight tracking-tight hover:no-underline hover:text-(--hover-color) after:content-[''] after:block after:w-1/2 after:max-w-48 after:h-px after:bg-(--base-color) after:my-1" href="{{ post.url | relative_url }}" title="{{ post.title | escape | strip }}" >
            {{ post.title | escape  }}
          </a>
        </h2>
        <div class="inline-block float-right max-sm:float-none max-sm:block max-sm:clear-right max-sm:mt-1">
          {% for tag in post.tags %}
          <a class="inline-block px-4 py-1 mb-1 mr-2 whitespace-nowrap bg-(--base-color) text-(--tag-color) rounded-3xl text-xs align-middle tracking-wide mt-0.5 hover:bg-(--hover-color) hover:text-(--tag-color)" href="/tags#{{ tag | cgi_escape }}" title="{{ tag | strip }}">{{ tag | strip }}</a>
          {% endfor %}
        </div>
        <p class="my-3 mx-0 mb-2">
            {{ post.excerpt | strip_html | truncate: 96 }}
        </p>
        <div class="float-right block clear-both">
          <div>
            <a class="text-(--text-color) p-1 text-center no-underline inline-block text-base my-1 mx-0.5 bg-transparent float-right read-more animatable uppercase align-middle" href="{{ post.url | relative_url }}" title="Read more about {{ post.title | escape | strip }}">
              Read more<span class="sr-only"> about {{ post.title | escape | strip }}</span>
              <svg focusable="false"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="fa fa-arrow-right fa-w-14 h-4 w-4"><path fill="currentColor" d="M216.464 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L387.887 239H12c-6.627 0-12 5.373-12 12v10c0 6.627 5.373 12 12 12h375.887L209.393 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L233.434 36.465c-4.686-4.687-12.284-4.687-16.97 0z" class=""></path></svg>
            </a>
          </div>
        </div>
      </li>
      {%- endfor -%}
    </ul>
  {%- endif -%}

</div>


{% if paginator.total_pages > 1 %}
<div class="mt-8">
  {% if paginator.previous_page %}
  <div>
    <a class="text-(--base-color) border border-(--border-color) border-solid rounded-full text-(--text-color) p-2 text-center no-underline inline-block text-base my-1 mx-0.5 bg-transparent float-left" href="{{ paginator.previous_page_path | prepend: site.baseurl }}" title="Newer"><svg class="inline-block align-middle h-3.5 w-3.5 mr-1" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"/></svg>Newer</a>
  </div>
  {% endif %}
  {% if paginator.next_page %}
  <div>
    <a class="text-(--base-color) border border-(--border-color) border-solid rounded-full text-(--text-color) p-2 text-center no-underline inline-block text-base my-1 mx-0.5 bg-transparent float-right" href="{{ paginator.next_page_path | prepend: site.baseurl }}" title="Older">Older<svg class="inline-block align-middle h-3.5 w-3.5 ml-1" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg></a>
  </div>
  {% endif %}
</div>
{% endif %}
