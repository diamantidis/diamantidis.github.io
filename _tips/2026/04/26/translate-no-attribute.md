---
layout: tips
title: "Prevent browser translation with the translate='no' attribute"
description: Learn how to use the translate HTML attribute to prevent browsers from translating brand names, product names, and other critical terms
date: 2026-04-26 06:00 +0200
tag: ["HTML"]
image:
    path: /assets/social/tips/translate-no-attribute.png
    width: 768
    height: 512
twitter:
    card: summary_large_image
---

When building a website, especially one for a brand or a company, maintaining the integrity of your brand's name and specific terms is crucial. However, when users utilize browser translation features, these important names can sometimes get unintentionally translated, leading to potential confusion or misrepresentation.

This is where the `translate="no"` HTML attribute comes in handy. By adding this attribute to specific elements, you instruct the browser's translation tools not to translate the content within those elements. This ensures that your brand name, product names, or any other critical terms remain unchanged, preserving their intended meaning and identity.

Let's look at a practical example. Imagine you have a brand named "TechNova". Without the `translate="no"` attribute, a user translating your webpage to Greek might see "ΤεχΝόβα", which not only sounds different but also loses the original branding essence. However, by wrapping the brand name in a span with `translate="no"`, you ensure that "TechNova" remains "TechNova" regardless of the translation applied to the rest of the page.

In summary, the `translate="no"` attribute is a simple yet powerful tool for web developers and content creators to maintain brand consistency across different languages. It's a small addition that can make a big difference in how your brand is perceived globally.

Thanks for reading. If this tip helped, consider [buying me a coffee] to support the blog. For questions or comments, feel free to reach out on [X]!

Until next time!

[buying me a coffee]: https://www.buymeacoffee.com/diamantidis
[X]: https://x.com/diamantidis_io