---
name: blog-skill
description: Repository-specific workflow for drafting, editing, converting, previewing, and publishing posts in this Jekyll blog repository. Use when Codex needs to create or revise files under `_posts/`, convert a plain Markdown document into this blog's post format, organize post images under `assets/images`, follow this repo's bilingual/front matter/article structure, apply its custom math/proof/code-block syntax, explain the local preview pipeline, or verify build and deployment steps for this blog.
---

# Blog Skill

## Overview

Follow the conventions of this repository instead of generic Jekyll advice.
Use the references to match the established post structure and local workflow before editing content or running release commands.

## Quick Start

- Read [references/post-style.md](references/post-style.md) before writing or restructuring a post.
- Read [references/project-map.md](references/project-map.md) before adding features, changing UI, changing rendering behavior, or modifying site-wide settings.
- Read [references/markdown-conversion.md](references/markdown-conversion.md) when the input starts as a plain Markdown file or notes dump.
- Read [references/bilingual-translation.md](references/bilingual-translation.md) when the task is to translate an existing post into its bilingual counterpart.
- Read [references/workflow.md](references/workflow.md) before preview, build, or deploy tasks.
- Start new posts from `_posts/templ.md` or `_posts/new-post.sh` unless the user explicitly wants a different structure.
- Inspect recent nearby posts on the same topic or in the same language before large edits so tone and formatting stay consistent.
- If a manually refined version of the same article exists, treat it as a stronger style signal than any earlier auto-converted draft.
- If the task is to build a bilingual counterpart from an existing post, preserve the original post as the primary version and generate the translated counterpart using the repo's bilingual pairing pattern.

## Writing Workflow

1. Determine whether the task is a new post, a revision to an existing post, or a bilingual counterpart.
2. Reuse the repository's opening structure: summary callout, `<!--more-->`, optional hidden math macro block, then the main body.
3. If the source is a plain Markdown file, normalize it into this repository's post structure, but preserve the source content and argument flow as much as possible.
4. Prefer the repo's custom blocks and enhanced code fences over ad hoc HTML or unsupported Markdown extensions.
5. Keep asset links repo-relative, typically under `/assets/...`.
6. Match the dominant section language to the post language; for Chinese technical posts, prefer Chinese headings and keep English terms in parentheses only when they help orientation.
7. Run a local Jekyll build after substantial edits; when visual behavior changed, also run the local preview flow.

## Guardrails

- Do not replace repo-specific Liquid tags with plain blockquotes or generic admonition syntax.
- Do not invent front matter keys when existing posts already show the pattern to follow.
- Do not treat older unpolished posts as the styling baseline when newer posts demonstrate the improved components and layout patterns.
- When converting a local Markdown draft into a publishable post, do not cut content or rewrite the article's reasoning structure unless the user explicitly asks for a shorter or reorganized version.
- Do not use `update_blog.sh` casually; it stages every change in the worktree and pushes `master`.
- Restart the preview server after `_config.yml` changes because Jekyll does not hot-reload that file.

## References

- [references/post-style.md](references/post-style.md): front matter, article skeleton, bilingual conventions, custom blocks, math, and enhanced code fences.
- [references/project-map.md](references/project-map.md): repository architecture, important page/layout/UI/config/plugin/script locations, and where to edit common site features.
- [references/markdown-conversion.md](references/markdown-conversion.md): how to turn a plain Markdown article into a polished post using this repo's recent style.
- [references/bilingual-translation.md](references/bilingual-translation.md): how to generate a faithful Chinese/English counterpart from an existing post while preserving bilingual blog behavior.
- [references/workflow.md](references/workflow.md): prerequisites, local preview/build commands, and cautious deployment notes for this repository.
