---
layout: post
title: "Automating Lighthouse CI for a static Blog"
description: "How to automate Lighthouse CI with local smoke tests, PR guardrails, and production monitoring to catch regressions before they ship."
date: 2026-05-22 12:00 +0200
tags: [Lighthouse, CI, Jekyll]
image:
  path: /assets/social/automated-lighthouse-ci-static-blog.png
  width: 703
  height: 512
twitter:
  card: summary_large_image
---

Over time, performance, accessibility, and SEO metrics on a blog tend to drift downward. You add a new feature, embed a script, or restructure a page, and the scores quietly degrade. Manual Lighthouse checks are an option, but only if you remember to run them. From personal experience, it is easy to forget, so I decided to automate the process with Lighthouse CI.

## Why Lighthouse CI

[Lighthouse CI (`@lhci/cli`)][lhci] lets you run Lighthouse audits from the command line and assert minimum scores across the four categories: Performance, Accessibility, Best Practices, and SEO. It uses a config file where you define which pages to test, how many runs per page, and what thresholds to enforce. The `collect` section controls what to audit, `assert` defines the pass/fail rules, and `upload` handles report storage.

The key advantage over running Lighthouse in Chrome DevTools is automation. You can integrate it into your development workflow and CI pipeline so it runs without you thinking about it.

## How I use it

For this blog, I identified three different workflows that I would like to cover. Let's explore them one by one.

### Scenario 1: Local Smoke Test

Before pushing any change, I run a quick smoke test against the local build with a single page and a single run. It takes about 10 seconds and gives me an immediate sanity check.

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./_site",
      "numberOfRuns": 1,
      "url": ["/"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.8 }],
        "categories:accessibility": ["warn", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }],
        "is-on-https": "off"
      }
    }
  }
}
```

Every assertion is set to `warn`, so it never blocks me. I can edit the `url` list to target a specific page I just added, for example a new blog post. The `is-on-https` check is disabled because the local static server doesn't use HTTPS, which would trigger a false positive.

To run it, I use these commands:
```bash
npm run build:css && JEKYLL_ENV=production bundle exec jekyll build
npm run lighthouse:smoke
```

### Scenario 2: PR Guardrail

But the smoke test is a manual step that can easily get skipped when rushing to ship. So I added a second layer that runs automatically on every pull request via GitHub Actions. This one uses a fixed list of representative pages that are important for this blog (home page and one random post).

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./_site",
      "numberOfRuns": 1,
      "url": [
        "/",
        "/2026/05/10/how-to-create-dynamic-quick-actions-ios-swift.html"
      ]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.85 }],
        "categories:best-practices": ["error", { "minScore": 0.8 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "is-on-https": "off"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

The CI workflow builds the site and runs Lighthouse before any code review happens:

```yaml
- name: Build
  env:
    JEKYLL_ENV: production
  run: bundle exec jekyll build

- name: Run Lighthouse CI
  run: npm run lighthouse
```

If Accessibility drops below 0.85 or SEO below 0.9, the CI job fails and the PR cannot be merged. Performance is a warning because it tends to vary more between runs.

### Scenario 3: Production Monitoring

Local builds and production have differences: HTTPS, hosting behavior, real network conditions. To catch issues that only appear in production, I run audits against the live site in two ways: after every deployment and on a nightly schedule.

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": [
        "https://diamantidis.github.io/",
        "https://diamantidis.github.io/about.html",
        "https://diamantidis.github.io/archive.html",
        "https://diamantidis.github.io/tags.html",
        "https://diamantidis.github.io/tips/",
        "https://diamantidis.github.io/2026/05/10/how-to-create-dynamic-quick-actions-ios-swift.html",
        "https://diamantidis.github.io/2021/10/17/two-way-communication-between-flutter-webview-and-a-web-page.html",
        "https://diamantidis.github.io/tips/2026/05/09/loop-a-video-on-ios.html"
      ]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.8 }],
        "categories:accessibility": ["warn", { "minScore": 0.85 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

This config uses full URLs instead of a `staticDistDir` and runs 3 times per page for more stable averages. The assertions focus on the four category-level scores, keeping the checks simple.

The post-deploy job uses `continue-on-error: true`, so it reports results without blocking the deployment:

```yaml
lighthouse:
  needs: deploy
  runs-on: ubuntu-latest
  continue-on-error: true
  steps:
    - name: Run Lighthouse CI
      run: npx lhci autorun --config=lighthouserc.live.json
```

The nightly cron runs the same config on a schedule (`0 3 * * *`), giving me a daily report I can review at my own pace.

## Conclusion

Automating Lighthouse audits has made quality metrics a consistent part of my workflow instead of an afterthought. What matters most is having the numbers easily available and part of the process, so my recommendation is to start with soft limits that would allow you to continue posting and plan to gradually tighten them as the blog evolves. If you maintain a blog or static site, I think this setup is straightforward to adapt and well worth the initial effort.

Thanks for reading! If you found this post useful, consider [buying me a coffee] to support the blog. For questions or comments, feel free to reach out on [X]!

Until next time!

[lhci]: https://github.com/GoogleChrome/lighthouse-ci
[lhci-maintenance]: https://github.com/GoogleChrome/lighthouse-ci/issues/1080
[buying me a coffee]: https://www.buymeacoffee.com/diamantidis
[X]: https://x.com/diamantidis_io
