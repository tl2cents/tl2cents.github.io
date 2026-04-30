# Plain Markdown Conversion

## Goal

Convert a generic Markdown document into a polished post for this repository.
Do not preserve the raw source formatting mechanically when the repo already has a better rendering primitive.

When the task is to turn a local Markdown draft into a publishable post, default to minimal-invasive editing:

- preserve the original content coverage as much as possible
- preserve the original argument order and writing logic as much as possible
- do not delete sections, examples, or technical discussion unless the user explicitly asks for compression or restructuring
- do not expand discussion by default; only do so when the user clearly asks for it

In that default mode, the allowed editorial changes are:

1. fix obvious typos directly, and report them in the final response
2. polish sentence expression, including grammar fixes, wording improvements, and local phrasing cleanup
3. expand part of the discussion only when the user explicitly requests expansion

Use recent posts as the style baseline first.

Prefer these over much older posts because the newer ones reflect the completed math/code/callout tooling.
For exact block syntax, bilingual declarations, and beautification primitives, also learn from:

- `_posts/2025-12-25-hello-world.md`
- `_posts/2025-12-25-hello-world-en.md`

## Conversion Workflow

1. Identify the article type: technical note, crypto writeup, tutorial, or image-heavy essay.
2. Preserve the article's information density and paragraph logic unless the user explicitly asks for shortening or reorganization.
3. Create proper front matter and opening structure.
4. Normalize formulas to this repo's MathJax habits.
5. Move or reference images under a dedicated `assets/images/<post-subdir>/` folder when the post owns local images.
6. Replace plain Markdown callouts and weak HTML with the repo's custom blocks.
7. Upgrade code fences, collapsible sections, and theorem-like environments where the content benefits.
8. If the post is bilingual or will likely get a translation, preserve the structure needed for paired articles.
9. For Chinese technical notes, localize section titles and subsection names instead of leaving large English heading chunks from the source.
10. Before finishing, run a math-format pass: no single-dollar math remains, every standalone `$$` display block has a blank line before and after it, and Liquid titles do not contain raw `$...$` math.

## Developer Checklist

Use this checklist during the implementation pass.

- Identify the target post language, topic, likely tags, date, title, and output filename.
- Preserve the source article's content coverage, argument order, examples, and technical discussion unless the user explicitly asks for compression or restructuring.
- Add valid front matter and the repository opening structure: summary block, `<!--more-->`, optional hidden macro block, then the main body.
- Fix obvious typos directly and keep notes for the final response.
- Polish local sentence expression without changing technical meaning.
- Convert single-dollar math to the repo's `$$...$$` style.
- Add blank lines before and after standalone display math blocks.
- Normalize absolute-value bars such as `|x|` to `\vert x \vert` inside formulas.
- Apply formula-normalization heuristics such as `\left...\right`, semantic operators, and modular notation when appropriate.
- Move or reference local images under `assets/images/<post-subdir>/` and render local blog images with `{% include figure.html %}` when suitable.
- Upgrade weak Markdown into repo-supported blocks, tables, enhanced code fences, and foldable sections when the content benefits.
- Preserve bilingual-readiness when a future paired version is likely.
- Run `bundle exec jekyll build` when a post file is written or substantially modified.

## Reviewer Checklist

Use this checklist in a separate review pass after the developer pass.

- Compare the converted post against the source Markdown for accidental deletions, reordered reasoning, or unrequested compression.
- Confirm the opening structure and `<!--more-->` placement produce a useful excerpt.
- Confirm every typo fix is legitimate and can be reported.
- Inspect math delimiters: no unintended `$...$`, no display math without surrounding blank lines, no raw `|...|` that can be parsed as a table, and no math delimiters inside Liquid titles.
- Inspect formulas for semantic changes introduced by normalization.
- Confirm custom blocks, details, theorem/proof blocks, code fences, and Kramdown attributes match repository-supported syntax.
- Confirm local images live under the expected `assets/images/<post-subdir>/` folder and use valid root-relative paths.
- Confirm Chinese/English heading language matches the post language and terminology choices are consistent.
- Confirm the converted post follows recent repository style rather than older unpolished posts.
- Confirm `bundle exec jekyll build` passes or record why it was not run.

## Manual Refinement Patterns To Apply During Conversion

When a plain Markdown draft already contains the right content but weak structure, perform the same structural packaging during conversion instead of leaving it for a later manual pass.

Use these target patterns:

- Opening reference lines such as papers, challenge repos, or source links -> group them near the top in `{% plain error title="参考链接" %}` or `{% plain error title="References" %}`.
- A formal problem statement of the form "given ..., find ..., such that ..." -> use `{% definition title="..." %}` and keep the defining equation inside the block.
- Algorithm-family bullet lists with repeated dimensions such as time, space, memory, or parallelism -> convert them to a comparison table.
- Short motivating questions or classical problem prompts -> use a concise blockquote with a bold lead phrase, not a large custom block.
- A compact algorithm recipe followed by its local conclusion -> wrap steps and conclusion together in `{% plain success title="..." %}`.
- Detailed mechanism explanations, failure cases, caveats, and complexity analyses -> wrap the whole local idea in `{% plain error title="..." %}` when a title helps, or `{% plain error %}` when the first bold sentence is already the title.
- Plain `**Remarks**` sections -> convert to `{% remark title="..." %}` with a descriptive title rather than the generic word "Remarks".
- Important one-sentence takeaways inside a remark -> keep them as a blockquote inside the remark so the conclusion is visually separated without creating another top-level section.
- Definitions introduced inline with bold text -> convert to `{% definition title="中文名 English Term" %}` when the concept is reused later.

Prefer integration over mechanical one-to-one conversion:

- Keep setup, notation, equations, and the immediate conclusion in one conceptual subsection.
- Combine algorithm steps with the following complexity sentence when they describe the same local algorithm.
- Combine multi-phase complexity discussions into one custom block with numbered phases followed by final complexity bullets.
- Keep external references together instead of scattering bare links through the opening paragraphs.
- Keep short implementation examples visible as normal code fences; use folding only for long scripts, large dumps, or auxiliary material.
- Add Kramdown code titles to benchmark outputs or repeated run logs so readers can compare runs quickly.

## Math Rules

This repository intentionally uses `$$...$$` for both inline and display math.

Rules to enforce:

- Inline formulas: use `$$x+y$$` inline with the sentence.
- Display formulas: also use `$$...$$`, but surround the formula block with at least one blank line before and after it.
- Treat missing blank lines around standalone `$$` lines as a conversion bug, not as an optional style cleanup.
- When a displayed derivation spans multiple lines, keep it in a standalone display block with enough surrounding whitespace for reliable parsing.
- If the source Markdown uses `$...$`, convert it to `$$...$$`.
- Do not put raw `$...$` or `$$...$$` math delimiters inside Liquid block attributes such as `title="..."`; use a plain-text title instead.
- If a formula contains absolute-value or norm bars such as `$|x|$` or `$|E(\mathbb{F}_p)|$`, rewrite the bars with LaTeX commands such as `\vert x \vert` or `\vert E(\mathbb{F}_p) \vert` to avoid accidental Markdown table parsing.
- If the source uses LaTeX theorem environments that Jekyll will not understand directly, convert them to repo-supported blocks.
- When parentheses, brackets, braces, or angle brackets wrap tall expressions, normalize them to `\left ... \right` style delimiters where appropriate.
- For generated groups, sets, operators, and modular notation, prefer semantic LaTeX such as `\left\langle ... \right\rangle`, `\operatorname{...}`, `\mid`, `\colon`, `\bmod`, and `\pmod{...}` over plain ASCII approximations.
- Use `\text{...}` for short text inserted inside math mode instead of raw prose in formulas.
- Preserve formula meaning when normalizing notation; these are formatting upgrades, not mathematical rewrites.

Example inline:

```markdown
The verifier checks whether $$e(g_1, g_2) = e(h_1, h_2)$$ holds.
```

Example display:

```markdown
We obtain

$$
\begin{aligned}
f(x) &= x^2 + 1 \\
g(x) &= x^2 - 1
\end{aligned}
$$

which completes the derivation.
```

### Additional Formula-Normalization Heuristics

- Rewrite `(...)` to `\left( ... \right)` when the content includes a fraction, sum, product, matrix, case split, or another tall subexpression.
- Keep small inline delimiters simple when `\left` and `\right` would add visual noise.
- Rewrite raw group-generation notation like `<P>` or `<P, Q>` to `\left\langle P \right\rangle` and `\left\langle P, Q \right\rangle` when the source is using mathematical angle-bracket notation.
- Prefer `\operatorname{ker}`, `\operatorname{im}`, `\operatorname{poly}`, `\operatorname{Span}` or the repo's established operator spelling when the source currently uses plain italic identifiers for operators.
- Prefer `\Pr`, `\mathbb{E}`, and similar standard notation for probability and expectation when the source already treats them as operators.
- Replace textual `mod p` inside formulas with `\bmod p` or `\pmod{p}` when that improves readability and matches the intended math style.
- Prefer `\coloneqq` or `:=` consistently for definitions within the same article rather than mixing several informal styles, but do not introduce package-dependent commands if the source already uses `:=` successfully.

## Image Rules

For a post with local images, use a dedicated subfolder under `assets/images/`.

Recommended layout:

```text
assets/images/<post-subdir>/
```

Choose `<post-subdir>` from stable post context, for example:

- a short date code
- a date-plus-slug
- another concise unique folder name already agreed by the user

Do not scatter a post's local images across unrelated folders if the post should own them.

### Preferred Rendering

For local blog images, default to:

```liquid
{% include figure.html src="/assets/images/<post-subdir>/image.png" alt="..." width="85%" caption="..." %}
```

This is the preferred pattern in recent image-heavy posts.

Use `<img ...>` only when one of these is true:

- the asset already lives outside `assets/images`, such as challenge files under `/assets/ctf-stuff/...`
- special raw HTML styling is needed, such as `referrerpolicy`, custom zoom, or centered rendering that `figure.html` does not cover cleanly

### Image Style Heuristics

- Use root-relative paths beginning with `/assets/...`.
- Supply meaningful `alt`.
- Add `caption` when the image conveys context worth naming.
- Use width controls commonly seen in recent posts such as `50%`, `65%`, `85%`, `95%`, or `100%`.
- For mathematical diagrams or graph sketches copied from notes, choose width by visual density: compact diagrams often work better around `60%` or `70%`; use `95%` only when full-width rendering materially improves legibility.
- For image galleries or extra photos, consider wrapping them in `{% plain fold ... %}` blocks.

## Upgrading Plain Markdown Structure

Do not leave plain Markdown in its weakest form when the content clearly maps to repo components.

### Weak source pattern -> preferred target

- Plain intro paragraph -> `{: .info}` summary block near the top.
- Long code dump -> titled or foldable enhanced code block.
- `<details>` without styling -> repo-styled `<details class="warning|info|success|exploit">` or `{% plain fold ... %}`.
- LaTeX theorem/proof environments -> `{% theorem %}`, `{% lemma %}`, `{% definition %}`, `{% proof %}`, `{% remark %}`.
- Generic admonitions -> `.info`, `.success`, `.warning`, `.error`, `<section class="...">`, or the corresponding Liquid block.
- Plain image markdown `![alt](...)` -> `{% include figure.html %}` for local blog images unless a simpler inline image is clearly better.
- Bare property bullet lists after a definition -> a titled `{% remark %}` or `{% plain info %}` block.
- Naive-vs-correct protocol sketches -> separate `{% plain info title="..." %}` and `{% plain error title="..." %}` blocks.
- A long correctness argument in the main flow -> move it into `{% proof fold title="..." %}` after a short intuition paragraph.

## Beautification Heuristics

When converting, actively improve presentation using the repo's current components:

- Wrap formal statements, definitions, and propositions with theorem-like blocks.
- Convert proof sketches and long derivations into `{% proof fold %}` or `<details class="info">` when that improves readability.
- Mark core pitfalls, attack ideas, and important reminders with `warning` or `error` style blocks.
- Mark challenge statements, small observations, and checkpoints with `success` or `info` blocks.
- Add `title="..."`, `type="..."`, and `fold="true"` to code fences when filenames or semantics are useful.
- Use `{% plain fold ... %}` for long side notes, expanded examples, or supplementary images.
- Prefer descriptive custom block titles over generic labels such as `Remarks`, `Notes`, or `Analysis`.
- Convert repeated nested bullet dimensions into tables when the comparison is easier to scan as rows and columns.
- Use quoted bridge paragraphs for short conceptual prompts, and reserve custom blocks for content that packages a complete local idea.

But keep these limits in mind during beautification:

- presentation upgrades should not silently remove technical detail from the source
- presentation upgrades should not reorder core claims unless the user asked for restructuring
- sentence-level polishing is preferred over paragraph deletion
- if you correct obvious typos, keep a note so the final response can list what was corrected

The target is not "same Markdown but valid."
The target is "looks like it belongs in this blog."

## Recent Style Preferences

Recent technical posts prefer:

- dense but structured prose
- highlighted core ideas using custom blocks
- foldable proofs and code
- consistent math notation
- selective use of raw HTML blocks only when they materially improve layout
- section and subsection names that match the post language
- fewer isolated one-line callouts, and more titled blocks that package a complete local idea
- a short intuition bridge before heavy formulas or protocol mechanics
- grouped external reading links near the relevant warning/background block, not dumped only at the end

Recent image-heavy posts prefer:

- `{% include figure.html %}` for local images
- widths tuned per image instead of one global default
- foldable photo collections with `{% plain fold ... %}`

Recent manually refined crypto notes also prefer:

- replacing English headings like `Isogenies`, `Examples`, `Correctness` with `同源映射`, `同源示例`, `SIDH 的正确性`
- merging overly fragmented paragraphs so the exposition reads as a continuous note rather than a literal Markdown conversion
- keeping English terminology on first mention in parentheses instead of every sentence

When you need the exact syntax for a block or bilingual declaration, prefer copying the pattern from the `hello-world` pair instead of inventing new Markdown or HTML.

When recent posts and older posts disagree, follow the recent posts.

## Bilingual Learning Requirement

When converting a post, always check whether the user wants or may later want a bilingual pair.

If the post is bilingual:

- create two Markdown files
- share the same `key`
- set `lang` explicitly
- put `bilingual: true` on the primary visible version
- put `hidden: true` on the secondary translation

Even when only one language is requested right now, avoid choices that would make a future bilingual pairing awkward, such as inconsistent titles, unstable file naming, or missing `key` planning when a pair is clearly expected.
