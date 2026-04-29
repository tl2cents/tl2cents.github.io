# Blog Post Style

## Canonical Sources

- `_posts/templ.md`: default skeleton for new posts.
- `_posts/new-post.sh`: helper that creates a dated post from the template.
- `_plugins/custom_blocks.rb`: custom Liquid blocks for theorem/proof/note/code wrappers.
- `_plugins/native_code_enhancer.rb`: Kramdown code-fence attributes such as `title`, `fold`, and `type`.
- `README-zh.md`: human-written explanation of the custom math blocks and enhanced code blocks.
- Nearby posts in `_posts/`: authoritative examples for tone and structure.

## Prefer Recent Posts

For style decisions, prioritize recent polished posts over older ones.

Some older posts predate the finished custom block/code-block workflow and should not override the newer style.

For bilingual declarations and block-level beautification syntax, explicitly study these two demo posts:

- `_posts/2025-12-25-hello-world.md`
- `_posts/2025-12-25-hello-world-en.md`

## File Naming And Location

- Put normal posts in `_posts/`.
- Use the standard Jekyll dated filename form: `YYYY-MM-DD-title.md`.
- When using `_posts/new-post.sh`, expect the script to create a dated filename from the title and seed it from `_posts/templ.md`.

## Front Matter Pattern

Start from this minimal shape unless an existing sibling post needs more:

```yaml
---
tags: TagA TagB TagC
title: "Post Title"
published: false
---
```

Common optional keys already used in this repo:

- `key`: shared identifier for bilingual post pairs.
- `lang`: language code such as `zh` or `en`.
- `bilingual: true`: mark the visible primary version of a bilingual article.
- `hidden: true`: hide the secondary translation from normal listing pages.

For bilingual pairs:

- Keep the same `key` in both files.
- Set `bilingual: true` on the visible primary article.
- Set `hidden: true` on the translation that should stay out of indexes.
- Set `lang` explicitly on both files.
- Learn this pairing pattern before creating or restructuring bilingual posts.

When generating a bilingual counterpart from an existing post:

- Treat the original post as the primary/default version.
- Do not demote the original post to a hidden translation.
- Keep the original filename unchanged whenever possible.
- Name the translated counterpart by appending the target language suffix before `.md`, for example:
  - Chinese original `YYYY-MM-DD-title.md` -> English translation `YYYY-MM-DD-title-en.md`
  - English original `YYYY-MM-DD-title.md` -> Chinese translation `YYYY-MM-DD-title-zh.md`
- If an older file uses an inconsistent suffix such as duplicated `.md`, normalize new work to the clean single-suffix form instead of copying the mistake.

## Opening Structure

The repo strongly prefers this opening sequence:

1. An info callout introducing the article.
2. `<!--more-->` for excerpt splitting.
3. An optional hidden math macro block.
4. A horizontal rule before the main body.

Typical English opening:

```markdown
{: .info}
**tl;dr:** Summarize the post in one or two sentences.

<!--more-->

<p hidden>$$
\def\Adv{\mathcal{A}}
$$</p>

---
```

Typical Chinese opening swaps `**tl;dr:**` for `**概要:**`.

When converting from a plain Markdown article, actively add this opening structure instead of preserving a bare first paragraph.

## Established Writing Style

- Keep the tone technical and dense.
- Open with a short summary, then move into definitions, constructions, attacks, or derivations.
- Use highlighted blocks to isolate definitions, remarks, pitfalls, exploit ideas, or step-by-step subresults.
- Put long code, exploit scripts, and server sources inside collapsible blocks instead of leaving them fully expanded.
- Preserve mathematical notation and inline LaTeX rather than paraphrasing it away.
- Upgrade weak source formatting into the repository's styled blocks when the content benefits from it.

For recent Chinese math/crypto posts, prefer these habits:

- Use Chinese section headings such as `## 背景知识`, `### 同源映射`, `### 代数性质`, and keep English only as a parenthetical aid when needed.
- Start major sections with one or two sentences of intuition before dropping into formulas or formal blocks.
- Group property lists inside `{% remark %}` or `{% plain ... %}` blocks instead of leaving many bare bullets in the main flow.
- Use `{% plain info|error %}` with a title for mini-protocols, failed ideas, implementation caveats, or FAQ-style clarifications.
- Use `{% proof fold title="..." %}` when correctness arguments are longer than a short paragraph.
- Prefer a short quoted intuition paragraph (`> ...`) when introducing a concept bridge between two sections.
- Use comparison tables when the source has repeated bullet dimensions such as time complexity, space complexity, and parallelism.
- Convert formal problem statements into `{% definition title="..." %}` blocks, and keep their defining equations inside the block.
- Use `{% plain success title="..." %}` for compact algorithms whose steps and immediate conclusion should be read together.
- Use `{% plain error title="..." %}` or `{% plain error %}` for complexity analysis, caveats, failed cases, or mechanism details that should stand out from the main flow.
- Convert generic `Remarks` into `{% remark title="..." %}` with a concrete title; if the key insight is a single sentence, place it as a blockquote inside the remark.
- When showing mathematical diagrams from the post's own assets, tune width by visual density. Compact graph sketches often read better around `60%` or `70%`; reserve `95%` for figures that need full-width detail.

Use the `hello-world` pair as the syntax reference for:

- `key` / `lang` / `bilingual` / `hidden` front matter combinations in bilingual posts
- `plain`, `theorem`, `proof`, `remark`, `note`, `example`, `solution` style blocks
- `inline`, `title="..."`, and `fold` variants for academic and collapsible blocks
- HTML block forms such as `<div class="info-block" markdown="1">` and `<details class="info" markdown="1">` when raw HTML is actually needed

## Callouts And Structured Blocks

The repo uses two families of highlighted blocks.

### Kramdown attribute blocks

Apply a class to the next paragraph or block:

```markdown
{: .info}
Important context.
```

Common classes in existing posts:

- `.info`
- `.success`
- `.warning`
- `.error`

### HTML section/details wrappers

Use these when the block is longer or needs richer nested Markdown:

```html
<section class="success" markdown="1">
**Definition.** Content here.
</section>
```

```html
<details class="warning">
<summary><b>Source Code</b></summary>
<div markdown="1">

```python
print("example")
```

</div>
</details>
```

Common classes include `info`, `success`, `warning`, `error`, and `exploit`.

## Custom Liquid Blocks

`_plugins/custom_blocks.rb` registers these tags:

- `proof`
- `theorem`
- `lemma`
- `proposition`
- `note`
- `remark`
- `example`
- `solution`
- `definition`
- `code_block`
- `plain`

Supported modifiers:

- `title="..."`: custom label shown by CSS.
- `fold`: render as collapsible `<details>`.
- `inline`: compact non-fold block layout.
- style tokens such as `success`, `info`, `warning`, `error`, `example`, `exploit`.

Examples:

```liquid
{% theorem %}
Statement here.
{% endtheorem %}
```

```liquid
{% proof fold title="Proof Sketch" %}
Argument here.
{% endproof %}
```

```liquid
{% note inline %}
Small aside here.
{% endnote %}
```

## Enhanced Code Fences

`_plugins/native_code_enhancer.rb` upgrades Rouge code blocks when Kramdown attributes appear under a fenced block.

Use the normal fenced syntax, then add attributes on the next line:

````markdown
```python
print("hello")
```
{: title="main.py" }
````

Supported attributes:

- `title="..."`: display a filename or caption.
- `fold="true"`: collapse by default.
- `fold="open"`: render as an opened `<details>` block.
- `type="success" | "info" | "warning" | "error" | "example" | "exploit"`: apply semantic styling.

Examples:

````markdown
```python
def exploit():
    pass
```
{: title="solve.py" type="exploit" fold="true" }
````

For more control, use the custom Liquid wrapper:

```liquid
{% code_block exploit fold title="solve.py" %}
```python
def exploit():
    pass
```
{% endcode_block %}
```

## Math And Diagrams

The site config enables these by default:

- `mathjax: true`
- `mermaid: true`
- `chart: true`

Practical implications:

- This repo prefers `$$...$$` for both inline and display math.
- For display math, keep at least one blank line before and after the `$$...$$` block.
- When absolute values, set cardinalities, or similar notation uses vertical bars, prefer `\vert ... \vert` instead of raw `|...|` so Markdown does not misread the line as a table.
- Keep shared macro definitions in a hidden `<p hidden>$$ ... $$</p>` block near the top when the post uses many custom commands.
- Do not remove MathJax wrappers from existing posts unless the user explicitly wants a rewrite.

Preferred LaTeX normalization habits for this repo:

- When delimiters wrap a visibly tall expression such as fractions, sums, matrices, or multiline terms, prefer `\left( ... \right)`, `\left[ ... \right]`, `\left\{ ... \right\}`, `\left\langle ... \right\rangle` instead of fixed-size delimiters.
- Do not force `\left` and `\right` on every small inline pair of parentheses; use them primarily when the visual height matters.
- For absolute values, norms, and cardinalities, prefer `\vert ... \vert`, `\lVert ... \rVert`, and related LaTeX delimiters over raw ASCII bars.
- For named operators and textual math functions, prefer semantic LaTeX such as `\operatorname{Adv}`, `\operatorname{poly}`, `\gcd`, `\Pr`, `\mathbb{E}` instead of plain italic identifiers when the symbol is conceptually an operator.
- For set-builder notation and conditions, prefer `\mid` or `\colon` over a raw `|` when the expression benefits from clearer mathematical meaning.
- For modular arithmetic, prefer `\mod`, `\bmod`, or `\pmod{...}` instead of raw text like `mod`.
- For short natural-language insertions inside formulas, prefer `\text{...}` instead of mixing plain text directly into math mode.
- Prefer `\left\langle ... \right\rangle` for generated groups, spans, or inner-product-like notation rather than raw angle brackets.
- Use `\frac` in display math and important inline formulas when readability matters; avoid cramped slash forms for nontrivial expressions.
- In multiline derivations, prefer `aligned`, `alignedat`, or similar structured environments over manually spaced lines.
- When an expression uses a delimiter on only one side, use `\left.` or `\right.` instead of mismatched raw delimiters.

## Asset And Link Conventions

- Store local attachments under `/assets/...`.
- For blog-owned local images, prefer a dedicated subfolder under `/assets/images/<post-subdir>/`.
- Use root-relative links such as `/assets/ctf-stuff/...` and `/assets/images/...`.
- Preserve external writeup or paper links in-line; the posts frequently cite GitHub repos, ePrint papers, and challenge attachments directly.

For local blog images, prefer this include form:

```liquid
{% include figure.html src="/assets/images/<post-subdir>/image.png" alt="..." width="70%" caption="..." %}
```

Use raw `<img>` only when the image needs special HTML attributes or already lives in a non-blog asset area.
Use `width="60%"` or `width="70%"` for compact diagrams and `width="85%"`, `width="95%"`, or `width="100%"` for dense screenshots, wide tables, or figures whose labels need more space.
