# Project Map

Use this reference before changing site behavior, UI, rendering style, layout structure, or repository-level settings. It is a map for quickly finding the right file rather than searching the whole Jekyll theme from scratch.

## Project Overview

This repository is a Jekyll blog built on a customized TeXt-style theme. The main content lives in `_posts/`, while the page shell, article list, article body, navigation, custom Markdown blocks, code block enhancement, and site-wide style are implemented locally in `_layouts/`, `_includes/`, `_plugins/`, and `_sass/`.

The most important rendering path is:

```text
index.html or a post
-> selected layout in _layouts/
-> _layouts/page.html
-> _layouts/base.html
-> includes, scripts, and Sass-generated assets
```

For normal blog writing, prefer `post-style.md`, `markdown-conversion.md`, and `bilingual-translation.md`. Use this file when the task asks for feature work, UI changes, site-wide rendering changes, or a question like "where is this behavior implemented?".

## Top-Level Settings

- `_config.yml`: primary Jekyll configuration, including `text_skin`, `highlight_theme`, site title/description, language/timezone, paths, pagination, Markdown enhancement flags, search, analytics, defaults for posts, and plugins.
- `_data/variables.yml`: theme defaults used when `_config.yml` or page front matter does not override a setting. Important for default language, default paths, page defaults, script sources, MathJax, Mermaid, and Chart settings.
- `_data/navigation.yml`: top navigation items and localized labels. Update this for site-wide header navigation labels or links.
- `_data/locale.yml`: locale strings used by helper includes such as `get-locale-string.html`.
- `_data/authors.yml` and `_data/licenses.yml`: author and license metadata used by article footer/header components.

After changing `_config.yml`, restart any running Jekyll server because config is not hot-reloaded.

## Layout Chain And Page Types

- `_layouts/base.html`: final HTML document shell. It emits `<!DOCTYPE html>`, `<html lang="...">`, `<head>`, the global script bundle, and wraps `{{ content }}`. Site-wide head/body behavior belongs here.
- `_includes/snippets/get-lang.html`: decides the page language from `page.lang`, then `site.lang`, then `_data/variables.yml`. If `html lang` behavior is wrong, inspect this and `_layouts/base.html` first.
- `_includes/head.html`: core metadata, canonical URL, RSS link, favicon, main CSS, Font Awesome source, and custom head includes.
- `_layouts/page.html`: shared page structure, header/footer inclusion, page main grid, aside, article header rendering, comment area, and main content wrapper.
- `_layouts/home.html`: homepage configuration. It uses `layout: articles`, sets `paginator.posts` as the article source, includes pagination, and includes `_includes/scripts/home.js`.
- `_layouts/articles.html`: generic article-list layout used by homepage/archive-like list pages. It resolves article data sources and passes rendering flags to `_includes/article-list.html`.
- `_layouts/article.html`: post body layout. It includes `_includes/article-lang-switch.html`, article footer, section navigator, sharing, and `_includes/scripts/article.js`.
- `_layouts/archive.html`: archive page layout and archive-specific script/style behavior.
- `_layouts/landing.html` and `_layouts/404.html`: special pages.

When adding a new page type, start by deciding whether it should inherit `page`, `articles`, `article`, or a special layout.

## Header, Navigation, And Language UI

- `_includes/header.html`: header shell, brand, logo, navigation loop, search button, and homepage-only language switch include.
- `_includes/svg/logo.svg`: header logo.
- `_includes/home-language-switch.html`: homepage EN/ZH language dropdown UI and early initialization script. It keeps the default homepage language aligned with the static `<html lang>`.
- `_includes/scripts/home.js`: homepage behavior. It updates `document.documentElement.lang`, toggles localized navigation labels, toggles localized article previews, handles language dropdown open/close, and observes external `lang` changes.
- `_sass/components/_header.scss`: header, navigation, search button placement, and homepage language switch styles. Match existing `.navigation__item` link behavior when adding controls to the header.

For homepage language behavior, keep these principles:

- Default language comes from static `<html lang="en">`, not from `localStorage`.
- Changing language must update both `document.documentElement.setAttribute('lang', lang)` and `document.documentElement.lang`.
- Header labels that need runtime switching should render both variants with `data-home-lang="en"` and `data-home-lang="zh"`.

## Homepage And Article Lists

- `index.html`: homepage front matter, currently `layout: home`.
- `_layouts/home.html`: homepage article source and list settings.
- `_layouts/articles.html`: passes `home_language_switch` to article-list rendering when `page.layout == 'home'`.
- `_includes/article-list.html`: main list renderer for item, brief, and grid article lists. It handles hidden posts, cover, title, excerpt, read more links, tags/date info, and bilingual translation discovery through post `key`.
- `_sass/components/_article-list.scss`: shared article-list styles, including bilingual/readmore link styling.
- `_sass/layout/_home.scss`: homepage-specific layout spacing and pagination styling.
- `_includes/paginator.html`: pagination UI.

When changing homepage post preview behavior, inspect `_layouts/home.html`, `_layouts/articles.html`, and `_includes/article-list.html` together. For bilingual homepage behavior, keep direct `CN`/`EN` links even when the main title/excerpt/readmore follows the selected homepage language.

## Article Page Rendering

- `_includes/article-header.html`: title/header rendering for pages and posts.
- `_includes/article-info.html`: date, tags, pageview, bilingual badge, and article metadata.
- `_includes/article-lang-switch.html`: article-page bilingual switch shown inside article content.
- `_includes/article-footer.html`: footer metadata, license, update time, and related post footer pieces.
- `_includes/article-section-navigator.html`: previous/next article navigation.
- `_includes/aside/toc.html` and `_includes/sidebar/toc.html`: table-of-contents sidebars.
- `_sass/components/_article-content.scss`: post body typography, Markdown element styling, tables, code display, callout/custom-block visual language, and content-specific details.
- `_sass/components/_article-header.scss`, `_article-info.scss`, `_article-footer.scss`: post header/info/footer styling.
- `_sass/layout/_article.scss`: article layout-level spacing and structure.

For post UI changes, prefer component Sass under `_sass/components/` before adding ad hoc inline HTML/CSS.

## Markdown Enhancements And Plugins

- `_plugins/custom_blocks.rb`: registers Liquid block tags: `proof`, `theorem`, `lemma`, `proposition`, `note`, `remark`, `example`, `solution`, `definition`, `code_block`, and `plain`. It converts tags into `div` or `details` with classes, optional `title`, `fold`, and `inline`.
- `_plugins/native_code_enhancer.rb`: post-render hook that enhances Rouge-generated code blocks with `title`, `fold`, and `type` attributes. It must parse full HTML documents, not fragments, so generated pages preserve doctype, `<head>`, and `<html lang>`.
- `_includes/markdown-enhancements.html`: central include that conditionally loads Chart, MathJax, and Mermaid.
- `_includes/markdown-enhancements/mathjax.html`: MathJax configuration and source.
- `_includes/markdown-enhancements/mermaid.html`: Mermaid setup.
- `_includes/markdown-enhancements/chart.html`: Chart.js setup.
- `_includes/scripts/enhance-code-blocks.js`: client-side code block enhancements.
- `_includes/scripts/copy-code.js`: copy button behavior and language-aware labels.

When changing custom block syntax or code block behavior, update both the Ruby plugin and the matching Sass/JS if the generated HTML shape changes.

## Sass And Visual Style

- `assets/css/main.scss`: the Sass import manifest. It imports skin variables first, then common components, then site components, layouts, and finally `_sass/custom.scss`.
- `_sass/skins/*.scss`: theme variables such as `$background-color`, `$text-color`, `$header-text-color`, `$border-color`, and `$main-color-*`. Change skins only when changing global visual theme.
- `_sass/common/_variables.scss`: base scale, spacing, button dimensions, layout heights, and common constants.
- `_sass/common/components/`: reusable theme primitives such as button, card, hero, menu, modal, toc, item, and swiper.
- `_sass/components/`: site components such as header, footer, article list, article content, article info, search, tags, author profile, and extensions.
- `_sass/layout/`: page-level layout files for base/page/article/articles/archive/home/landing/404.
- `_sass/custom.scss`: repository-specific visual additions and overrides. Use this for broad custom additions when they are not cleanly tied to a component.

Style guidance for this repo:

- Prefer existing variables like `$header-text-color`, `$main-color-1`, `$border-color-l`, `$background-color`, and `$text-background-color`.
- Keep header controls visually consistent with `.navigation__item` unless the task explicitly asks for a distinct control.
- Put component-specific styles beside the component Sass file. For example, header controls belong in `_sass/components/_header.scss`, while post body rendering belongs in `_sass/components/_article-content.scss`.
- Rebuild after Sass changes with `bundle exec jekyll build`.

## JavaScript Locations

- `_includes/scripts/common.js`: global behavior loaded by `base.html`.
- `_includes/scripts/page.js`: page-level behavior.
- `_includes/scripts/article.js`: post page behavior loaded by `_layouts/article.html`.
- `_includes/scripts/home.js`: homepage behavior loaded by `_layouts/home.html`.
- `_includes/scripts/archieve.js`: archive-specific behavior. The filename is intentionally spelled this way in the current repo.
- `_includes/scripts/enhance-code-blocks.js`: code block client-side behavior.
- `_includes/scripts/copy-code.js`: copy button behavior and localized copy text.
- `_includes/scripts/variables.html`: exposes site/theme variables to client scripts.
- `assets/search.js`: search index/client logic.

For page-specific functionality, prefer the matching `_includes/scripts/*.js` file rather than putting large inline scripts into layouts.

## Assets, Images, And Static Files

- `assets/images/`: image assets for posts and pages. For post-specific images, use a dedicated subfolder per post when possible.
- `assets/css/main.scss`: CSS entrypoint compiled by Jekyll.
- `assets/favicon*`, `assets/site.webmanifest`, and related icons: site favicon and PWA-ish metadata assets.
- `_includes/figure.html` and `_includes/video.html`: reusable media includes.
- `_includes/extensions/`: embeds for Bilibili, YouTube, NetEase Cloud Music, CodePen, SlideShare, SoundCloud, TED, and similar external content.

Use root-relative links such as `/assets/images/...` in posts unless there is a specific reason not to.

## Search, Analytics, Comments, Sharing, And Pageview

- `_config.yml`: selects providers for search, analytics, comments, sharing, and pageview.
- `_includes/search.html` and `_sass/components/_search.scss`: search UI.
- `_includes/search-providers/`: provider-specific search implementations. Inspect the selected provider before editing search behavior.
- `_includes/analytics.html` and `_includes/analytics-providers/`: analytics loader.
- `_includes/comments.html` and `_includes/comments-providers/`: comments integration.
- `_includes/sharing.html` and `_includes/sharing-providers/`: sharing integration.
- `_includes/pageview.html`: pageview display hook.

Provider changes usually require `_config.yml` edits and a server restart.

## Bilingual System

- Post front matter uses `key`, `lang`, `bilingual`, `hidden`, and `published` to pair versions and control list visibility.
- `_includes/article-lang-switch.html`: article-page language switch.
- `_includes/article-list.html`: homepage/list-level bilingual discovery and readmore links.
- `_includes/article-info.html`: bilingual badge display.
- `_includes/snippets/get-lang.html`: static page language.
- `_includes/scripts/home.js`: runtime homepage language switching.

The primary post version usually remains visible, while translated counterparts are often `hidden: true` so list pages do not duplicate entries. Keep `key` identical across language variants.

## Common Change Recipes

### Add A Header Navigation Item

1. Edit `_data/navigation.yml`.
2. If the item should localize, add `titles.en` and `titles.zh`/`zh-Hans`.
3. Check `_includes/header.html` only if the item needs custom behavior.
4. Rebuild and inspect the homepage and article pages.

### Change Homepage Preview Behavior

1. Inspect `_layouts/home.html` for data source and display flags.
2. Inspect `_layouts/articles.html` for how flags are passed to the list renderer.
3. Edit `_includes/article-list.html` for title/excerpt/readmore logic.
4. Add styles to `_sass/components/_article-list.scss` or `_sass/layout/_home.scss`.
5. Run `bundle exec jekyll build`.

### Change Article Body Rendering

1. Check `_plugins/custom_blocks.rb` for custom Liquid block output.
2. Check `_plugins/native_code_enhancer.rb` for post-render code block transformation.
3. Check `_sass/components/_article-content.scss` and `_sass/custom.scss` for visual styling.
4. Check `_includes/markdown-enhancements.html` if MathJax/Mermaid/Chart loading is involved.
5. Run `bundle exec jekyll build` and preview a post using the affected syntax.

### Add Page-Specific JavaScript

1. Put code in the matching `_includes/scripts/*.js` file.
2. Include it from the corresponding layout if no script slot exists yet.
3. Avoid global side effects unless the behavior is site-wide.
4. Rebuild and inspect generated `_site` output for script placement.

### Change Global Style Or Skin

1. Check `_config.yml` for `text_skin` and `highlight_theme`.
2. Check `assets/css/main.scss` import order.
3. Prefer component Sass for component changes.
4. Use `_sass/custom.scss` for repo-specific broad overrides.
5. Run `bundle exec jekyll build`.

## Verification Checklist For Feature/UI Changes

After feature or UI work:

1. Run `bundle exec jekyll build`.
2. Inspect generated `_site/index.html` or the affected `_site/...` page when layout, language, script, or meta behavior changed.
3. Confirm `<html lang="...">` is present when touching plugins or layout shell.
4. Check homepage, an article page, and archive page if the header/navigation changed.
5. Check both a bilingual and non-bilingual post preview if article-list logic changed.
6. If Sass changed, verify the compiled CSS contains the expected selectors under `_site/assets/css/main.css`.
