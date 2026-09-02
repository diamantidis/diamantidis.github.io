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
      <li class="block">
        {% include card.html item=post type="tip" %}
      </li>
      {%- endfor -%}
    </ul>
  {%- endif -%}

</div>


{% if paginator.total_pages > 1 %}
<div class="mt-8">
  {% if paginator.previous_page %}
  <div>
    <a class="text-(--base-color) border border-(--border-color) border-solid text-(--text-color) p-2 text-center no-underline inline-block text-base my-1 mx-0.5 bg-transparent float-left" href="{{ paginator.previous_page_path | prepend: site.baseurl }}" title="Newer"><i class="fa fa-chevron-left"></i>Newer</a>
  </div>
  {% endif %}
  {% if paginator.next_page %}
  <div>
    <a class="text-(--base-color) border border-(--border-color) border-solid text-(--text-color) p-2 text-center no-underline inline-block text-base my-1 mx-0.5 bg-transparent float-right" href="{{ paginator.next_page_path | prepend: site.baseurl }}" title="Older">Older<i class="fa fa-chevron-right"></i></a>
  </div>
  {% endif %}
</div>
{% endif %}
