# Bilingual Post Translation

## Goal

Generate a Chinese/English counterpart from an existing post while preserving the repository's bilingual blog behavior.

This is a separate workflow from plain Markdown-to-post conversion.
Use it when the source is already a blog post under `_posts/` and the task is to create the opposite-language version.

## Core Principles

- Keep the original article as the primary/default version.
- Do not demote the original post to a hidden translation.
- Do not add, remove, or reorder meaning.
- Preserve the source article's section structure and information density.
- Preserve formulas, displayed derivations, references, captions, image placement, code, and block structure.
- Preserve HTML syntax, Liquid blocks, and Markdown rendering structure exactly; do not translate structural or formatting syntax.
- Preserve domain terminology carefully, especially for cryptography, mathematics, and computer science posts.
- Prefer technical and academic phrasing over casual paraphrase.

## File Naming And Front Matter

When generating the translated counterpart from an existing post:

1. Detect the source language from front matter and content.
2. Keep the original filename unchanged whenever possible.
3. Create the translated counterpart by appending the target language suffix before `.md`.
4. Reuse the same `key` in both files.
5. Ensure the original article is the visible primary version and carries `bilingual: true`.
6. Set `lang` explicitly on both files.
7. Set `hidden: true` on the translated counterpart.

Recommended naming:

- Chinese original `YYYY-MM-DD-title.md` -> English translation `YYYY-MM-DD-title-en.md`
- English original `YYYY-MM-DD-title.md` -> Chinese translation `YYYY-MM-DD-title-zh.md`

If an older file in the repository uses an inconsistent suffix pattern, do not copy that mistake into new files.

## Translation Workflow

1. Read the source post and determine the translation direction.
2. Preserve all formulas, block structure, image includes, code blocks, references, HTML syntax, Liquid blocks, and Markdown rendering syntax.
3. Translate titles, summaries, and prose faithfully.
4. Keep the summary label in the target language:
   - Chinese posts usually use `**概要:**`
   - English posts usually use `**tl;dr:**` or `**Abstract:**`, following the nearby style
5. Insert an explicit translation disclaimer immediately after `<!--more-->` in the translated post so the homepage excerpt stays focused on the article summary.
6. Preserve the original post as the default visible article.
7. Run a local build check if the task includes actually writing the translated file.

## Translation Disclaimer Templates

Use the `hello-world` pair as the bilingual syntax reference, and follow the repository's existing AI-disclaimer style without copying normal content posts into the skill text.

Chinese template:

```markdown
{: .error}
**声明：** 本文由 `AgentName` + `ModelName` 基于原始英文博客自动生成对应的中文翻译版本。翻译尽量保持原文语义、结构与技术细节不变；若存在歧义或表述不准确之处，请以英文原文为准。
```

English template:

```markdown
{: .error}
**Disclaimer:** This article is the English counterpart automatically generated from the original Chinese blog by `AgentName` + `ModelName`. The translation aims to preserve the original meaning, structure, and technical details as faithfully as possible. If there is any ambiguity or inaccuracy, please refer to the original Chinese version.
```

Usage rules:

- Fill in the actual agent name and model name.
- Adjust the source/target language wording to match the real translation direction.
- Keep the disclaimer concise and technical.
- Place it immediately after `<!--more-->`, before the optional macro block, horizontal rule, references, or main body. Do not place the disclaimer before `<!--more-->`.

Recommended bilingual opening order:

```markdown
{: .info}
**tl;dr:** Target-language summary.

<!--more-->

{: .error}
**Disclaimer:** This article is ...

<p hidden>$$
...
$$</p>

---
```

## Terminology Rules

- In cryptography, mathematics, and computer science posts, preserve established English terms when direct translation would be ambiguous.
- Translate explanatory prose, but keep technical terms in English when that is the clearer field convention.
- Be careful with names of assumptions, attacks, protocols, algebraic objects, proof systems, and complexity terms.
- If a sentence is genuinely ambiguous in the source, translate conservatively and mention the ambiguity in the final response.

## Rendering Guardrails

- Do not silently rewrite mathematical claims during translation.
- Do not change equation delimiters unless a purely mechanical rendering fix is required by the repo.
- Do not alter theorem statements, proof structure, or figure references.
- Do not disturb image paths or code-fence metadata.
- Keep HTML tags, Liquid tags, include statements, Kramdown attribute lines, and other rendering-oriented Markdown syntax byte-for-byte identical whenever possible.
- Do not translate inline code spans such as `` `code` ``.
- Do not translate fenced code blocks introduced by triple backticks or equivalent code-fence syntax.
- Do not translate raw HTML examples, Liquid examples, or Markdown syntax demonstrations when they are serving as code or rendering examples.
- Translation quality must not come at the cost of broken MathJax, Liquid tags, or image rendering.

## Developer Checklist

Use this checklist during the implementation pass.

- Detect source language and target language from front matter and content.
- Preserve the original post as the visible primary/default version.
- Create the translated counterpart with a clean language suffix before `.md`.
- Keep `key` identical across both versions.
- Set `lang` explicitly on both versions.
- Set `bilingual: true` on the primary visible version.
- Set `hidden: true` on the translated counterpart unless the user explicitly asks otherwise.
- Keep formulas, images, references, HTML, Liquid, Markdown structure, inline code, and fenced code structurally intact.
- Translate prose faithfully without adding, deleting, or reordering meaning.
- Preserve domain terminology carefully for cryptography, mathematics, and computer science.
- Put the target-language summary before `<!--more-->`.
- Put the translation disclaimer immediately after `<!--more-->`.
- Run `bundle exec jekyll build` when a translated file is written.

## Reviewer Checklist

Use this checklist in a separate review pass after the developer pass.

- Confirm the generated counterpart builds a valid bilingual pair with the original post.
- Confirm the original/default post was not renamed, hidden, or semantically rewritten.
- Confirm the translated file has the expected filename suffix and front matter.
- Confirm the disclaimer is after `<!--more-->`, not before it.
- Confirm the homepage excerpt will show the article summary rather than the AI disclaimer.
- Compare representative sections against the source for omissions, additions, mistranslations, or reordered claims.
- Inspect formulas for broken delimiters, changed semantics, missing blank lines around display blocks, and accidental Markdown table parsing from raw `|...|`.
- Confirm raw HTML, Liquid tags, Kramdown attributes, inline code, and fenced code were not translated or structurally modified.
- Confirm image paths, captions, references, and links still point to valid targets.
- Confirm `bundle exec jekyll build` passes or record why it was not run.
