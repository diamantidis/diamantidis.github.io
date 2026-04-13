# AGENTS.md - Guide for Agentic Software Development

## Project Overview

Ioannis Diamantidis's personal blog — a software development blog built with Jekyll (Ruby static site generator) using the minima theme and styled with a combination of SCSS and Tailwind CSS. The site is hosted on GitHub Pages and deployed automatically via GitHub Actions.

- **Technology Stack**: Jekyll + minima theme + Tailwind CSS (via jekyll-postcss) + Ruby + Node.js
- **Language**: English
- **Hosting**: GitHub Pages (`diamantidis.github.io`)
- **Deployment**: Automatic via GitHub Actions on merge to `source` branch
- **Branching**: `source` branch contains the Jekyll project; `master` branch contains the built site

## Project Structure

```
/
├── _layouts/           # Jekyll layout templates
│   ├── compress.html   # HTML compression layout
│   ├── default.html    # Base layout (compress wrapper)
│   ├── home.html       # Home page with paginated posts
│   ├── page.html       # Static pages
│   ├── post.html       # Blog posts
│   └── tips.html       # Tips collection items
├── _includes/          # Reusable HTML components
│   ├── head.html       # HTML head with meta, CSS, analytics
│   ├── header.html     # Site header with navigation
│   ├── footer.html     # Site footer
│   ├── favicon.html    # Favicon links
│   ├── icons.html      # SVG icons
│   ├── post-subheader.html  # Post metadata (date, tags)
│   ├── tips-subheader.html  # Tips metadata
│   ├── posthog.html    # PostHog analytics (production only)
│   └── telemetry-deck.html  # TelemetryDeck analytics (production only)
├── _pages/             # Static pages
│   ├── about.md        # About page
│   ├── archive.md      # Post archive
│   ├── tags.md         # Tags page
│   └── tips.md         # Tips listing page
├── _posts/             # Blog posts (Markdown)
├── _tips/              # Tips collection (short-form content)
├── _scss/              # SCSS stylesheets
│   ├── custom.scss     # Custom styles + Tailwind @apply directives + CSS variables
│   └── minima/         # Minima theme overrides (syntax highlighting)
├── assets/
│   ├── main.scss       # Main SCSS entry point (imports minima theme + custom)
│   ├── css/
│   │   └── main.css    # Additional compiled CSS
│   ├── socialIcon.png  # Default social sharing image
│   ├── tips/           # Tip-specific assets
│   └── [post dirs]/    # Per-post image assets
├── .github/
│   └── workflows/
│       ├── ci.yml            # CI: build + Danger prose lint on PRs
│       └── github-pages.yml  # Build & deploy to GitHub Pages on push to source
├── _config.yml         # Jekyll configuration
├── tailwind.config.js  # Tailwind content paths config
├── postcss.config.js   # PostCSS config (Tailwind + cssnano in production)
├── Dangerfile          # Danger + prose linting rules
├── package.json        # Node.js dependencies (tailwindcss, postcss, cssnano)
├── Gemfile             # Ruby dependencies (Jekyll plugins)
└── .ruby-version       # Ruby version (3.3.4)
```

## Key Features

- **Pagination**: Jekyll Paginate V2 with 7 posts per page
- **Dark Mode**: Automatic via CSS custom properties (`prefers-color-scheme` media query)
- **Tips Collection**: Short-form content at `/tips/` using Jekyll collections
- **Analytics**: TelemetryDeck and PostHog (production environment only)
- **CI/CD**: GitHub Actions CI with Danger + proselint for prose linting on PRs
- **SEO**: jekyll-sitemap, jekyll-feed, and jekyll-seo-tag
- **Prose Linting**: Danger-prose checks spelling and prose style on every PR
- **Buy Me a Coffee**: Support widget integrated in page head
- **HTML Compression**: Custom compress layout for minified HTML output

## How to Run the Website

### Prerequisites

- **Ruby** 3.3.4 (see `.ruby-version`)
- **Node.js** 22.2.0
- **Bundler** (Ruby gem manager)

### Installation

```bash
# Install Ruby dependencies
bundle install

# Install Node.js dependencies (Tailwind CSS, PostCSS, cssnano)
npm install
```

### Running the Development Server

Tailwind CSS is processed automatically through the `jekyll-postcss` plugin during Jekyll builds — there is **no separate CSS watcher process** needed. Just run Jekyll:

```bash
# Start Jekyll server
bundle exec jekyll serve

# Or with host binding:
bundle exec jekyll serve --host 0.0.0.0
```

The site will be available at `http://127.0.0.1:4000`.

### Port Availability Check

Before starting, check if the default port is available:

```bash
lsof -i :4000
```

If port 4000 is in use, run on an alternative port:

```bash
bundle exec jekyll serve --port 4001
```

### Background Process Management

**Starting in the background:**

```bash
# Start Jekyll in background with PID tracking
nohup bundle exec jekyll serve --host 0.0.0.0 > jekyll.log 2>&1 &
echo $! > .jekyll.pid
echo "Jekyll started with PID: $(cat .jekyll.pid)"

# Check logs anytime:
tail -f jekyll.log
```

**Stopping:**

```bash
# Kill using PID file (recommended — safest)
if [ -f .jekyll.pid ]; then
  kill $(cat .jekyll.pid) && rm .jekyll.pid
  echo "Jekyll stopped"
fi

# Or kill by port (fallback)
kill $(lsof -ti :4000)
```

**IMPORTANT**: Only stop processes that you started. Never kill processes you did not start.

## Tailwind CSS Setup

This project uses `jekyll-postcss` to integrate Tailwind CSS into the Jekyll build pipeline. This is different from projects that use a standalone Tailwind CLI watcher.

- **How it works**: PostCSS processes CSS files during Jekyll builds via the `jekyll-postcss` plugin
- **Config**: `postcss.config.js` loads Tailwind CSS and applies cssnano in production (`JEKYLL_ENV=production`)
- **Content paths**: Configured in `tailwind.config.js` — scans `_posts/`, `_pages/`, `_includes/`, `_layouts/`, and root HTML/MD files
- **Usage**: Tailwind utility classes are used via `@apply` directives in `_scss/custom.scss`
- **No separate build step**: Just run `bundle exec jekyll serve` — Tailwind is processed automatically

## Verifying Changes with Playwright MCP

**Important Navigation Principle**: Always navigate through the UI starting from the home page. Never open URLs directly. This ensures you test the actual user flow.

### Smoke Test Workflow

#### 1. Navigate to Home Page

- Use `playwright_browser_navigate` to go to `http://127.0.0.1:4000` (or your chosen port)
- Use `playwright_browser_snapshot` to verify the page structure
- Verify blog post listings are present

#### 2. Navigate to a Blog Post

- Use `playwright_browser_snapshot` to see available post links
- Use `playwright_browser_click` to click on a post title
- Use `playwright_browser_snapshot` to verify the post page loaded with title, content, and metadata

#### 3. Verify Static Pages

- Navigate back to the home page
- Click on navigation links (About, Archive, Tags, Tips)
- Use `playwright_browser_snapshot` to verify each page loads correctly with expected content

### Conceptual Test Flow

```
1. Navigate → Home page (http://127.0.0.1:4000)
2. Snapshot → Verify home page structure and post listings
3. Click → A blog post title
4. Snapshot → Verify post page loaded (title, content, metadata)
5. Navigate back → Home page
6. Click → About page link
7. Snapshot → Verify about page content
8. Navigate back → Home page
9. Click → Archive page link
10. Snapshot → Verify archive page content
```

### Tips for Verification

- Always use snapshots to understand the current page state before interacting
- Take screenshots at key points for visual verification
- Verify both structure (elements exist) and content (text is correct)
- Check that code blocks and syntax highlighting render properly in posts

## Git Workflow with gh-cli

All Git operations should use the GitHub CLI (`gh`) for consistency.

### Branching Model

- **`source` branch**: Development branch containing the Jekyll project source
- **`master` branch**: Auto-generated from CI — contains the built static site. **Never edit directly.**
- All work happens on feature branches off of `source`

### Commits - Small Iterations

- **Make small, focused commits**: Each commit should represent one logical change
- **One change per commit**: Don't mix unrelated changes
- **Clear commit messages**: Describe what and why, not just what

```bash
# Stage specific changes
git add path/to/specific/file

# Commit with descriptive message
git commit -m "Add dark mode support for post code blocks"

# Repeat for next logical change
git add another/file.md
git commit -m "Update about page with new bio section"
```

### Creating Pull Requests

After pushing changes to a remote branch, create a PR against `source`:

```bash
# Push your branch
git push -u origin your-branch-name

# Create PR with plan and tests
gh pr create \
  --base source \
  --title "Add responsive image component to posts" \
  --body "## Plan
- Implement responsive image component in posts
- Add lazy loading for post images
- Update existing posts to use new component

## Tests
- Manual verification: Home page loads correctly
- Playwright smoke test: PASS
  - Home page navigation works
  - Blog post page loads with content
  - Static pages (About, Archive, Tags) render correctly
- Visual verification: Images display correctly
- CI checks: Danger prose lint passes"
```

### PR Structure Template

**Title**: Clear, descriptive title summarizing the change

**Body**:
- **Plan section**:
  - What this PR accomplishes
  - Key changes and implementation decisions
  - Any important context

- **Tests section**:
  - Manual verification performed
  - Playwright smoke test results (PASS/FAIL)
  - Specific steps verified
  - CI check results (Danger prose lint)

### After PR Creation

- Monitor CI/CD checks via GitHub Actions (build + Danger lint)
- Fix any prose linting issues flagged by Danger
- Respond to any review feedback
- Squash commits if requested before merge

### Useful gh-cli Commands

```bash
# List PRs
gh pr list

# View PR details
gh pr view <PR_NUMBER>

# Check PR status
gh pr status

# Merge PR (after approval)
gh pr merge <PR_NUMBER>
```

## Best Practices for Agents

1. **NEVER kill processes you didn't start** — Only stop processes that you initiated
2. **No separate CSS watcher needed** — Tailwind runs through jekyll-postcss automatically
3. **Always check port availability** before starting Jekyll server
4. **Use background processes** with PID files and log files for Jekyll
5. **Navigate through UI** for Playwright tests, never direct URLs
6. **Make small commits** representing single logical changes
7. **Write descriptive commit messages** explaining the "why"
8. **Create PRs against `source` branch** — never target `master` directly
9. **Verify changes with Playwright** smoke test before marking work complete
10. **Check CI results** — Danger will flag prose issues on PRs
11. **Use snapshots** to understand page state before interactions
12. **Don't edit `master` branch** — it's auto-generated from CI
13. **Tailwind classes go in `_scss/custom.scss`** via `@apply` directives, not in HTML templates directly
