# Developer And Reviewer Workflow

Use this workflow for substantial blog tasks that benefit from implementation followed by independent review:

- converting a plain Markdown draft into a publishable post
- creating a bilingual counterpart
- modifying homepage/list behavior
- changing UI, Sass, layouts, scripts, plugins, or rendering behavior
- editing mathematically dense or cryptography-heavy posts

For small typo-only edits, a single careful pass is enough.

## Roles

### Developer Agent

The Developer Agent owns implementation.

Responsibilities:

- Read the relevant references before editing.
- Make the requested content, UI, layout, script, or rendering changes.
- Preserve user intent and repository conventions.
- Keep edits scoped to the task.
- Run the relevant build or validation command when files are changed.
- Produce a concise implementation summary and list any known risks.

For content work, the Developer Agent should focus on faithful conversion or translation, style matching, math normalization, image handling, and syntax correctness.

For code/UI work, the Developer Agent should focus on the correct layout/include/script/Sass/plugin location, minimal integration surface, and compatibility with existing theme conventions.

### Reviewer Agent

The Reviewer Agent owns independent verification.

Responsibilities:

- Review the Developer Agent's output against the task-specific checklist.
- Prioritize correctness, broken rendering, missing requirements, semantic drift, math mistakes, front matter errors, and build failures.
- Inspect generated output or representative source snippets when relevant.
- Do not rewrite the post or feature wholesale unless the review finds a concrete defect.
- Return actionable findings first, then residual risks and a pass/fail recommendation.

The Reviewer Agent should be stricter than the Developer Agent on omissions, accidental meaning changes, broken Liquid/Markdown, image paths, math delimiters, and front matter consistency.

## Model And Agent Selection

Use the current/default strong Codex model for both roles unless there is a clear reason to specialize.

Recommended selection:

- Developer Agent: use a production/editing-capable agent with write access for implementation. In Codex sub-agent terms, prefer a `worker` for code or file edits.
- Reviewer Agent: use an independent review-oriented agent. In Codex sub-agent terms, prefer an `explorer` or default read-only review pass when the review does not need edits.
- For cryptography, mathematics, dense proof material, large Markdown conversion, bilingual translation, Jekyll plugin changes, or layout/script refactors, use equal-or-stronger reasoning for the Reviewer Agent than for the Developer Agent.
- Do not use a smaller or faster model for the Reviewer Agent when semantic fidelity, math correctness, or rendering correctness is central.
- If only one model is available, still separate the work into a Developer pass and a Reviewer pass with the appropriate checklist.

When multiple agents are actually available, keep write scopes disjoint:

- Developer Agent may edit the target files.
- Reviewer Agent should inspect and report findings first.
- If fixes are required, either send them back to the Developer Agent or apply a focused local fix after reviewing the finding.

## Required Sequence

1. Determine the task type.
2. Read the relevant reference files:
   - `post-style.md` for post structure and syntax
   - `markdown-conversion.md` for plain Markdown conversion
   - `bilingual-translation.md` for bilingual counterparts
   - `project-map.md` for UI, layout, scripts, plugins, Sass, and site settings
   - `workflow.md` for build, preview, and deployment
3. Developer Agent performs the implementation pass.
4. Developer Agent runs the relevant validation:
   - content or layout changes: `bundle exec jekyll build`
   - visual/UI changes: build plus local preview when feasible
   - documentation-only skill changes: syntax/link sanity check is usually sufficient
5. Reviewer Agent checks the output against the task-specific checklist.
6. If review finds defects, fix them and rerun the relevant checklist section.
7. Final response reports what changed, what validation ran, and any residual risks.

## Task-Specific Checklists

Use the checklist from the task-specific reference:

- Plain Markdown conversion: `markdown-conversion.md` Developer Checklist and Reviewer Checklist.
- Bilingual translation: `bilingual-translation.md` Developer Checklist and Reviewer Checklist.
- Feature/UI/rendering changes: use `project-map.md` Verification Checklist plus the Code/UI checklist below.

## Code/UI Developer Checklist

- Identify the correct location using `project-map.md`.
- Prefer existing layout/include/script/Sass structure over new ad hoc files.
- Keep UI controls visually consistent with surrounding components unless the user asks for a distinct style.
- Use existing Sass variables and component files.
- Keep JavaScript page-scoped when behavior is page-specific.
- Preserve accessibility basics: semantic controls, labels, keyboard close behavior for dropdowns, and correct `aria-*` state where needed.
- Preserve language behavior: if runtime language changes are involved, update both `document.documentElement.setAttribute('lang', lang)` and `document.documentElement.lang`.
- Avoid changing unrelated pages or post listings.
- Run `bundle exec jekyll build`.

## Code/UI Reviewer Checklist

- Confirm the implementation is in the expected files from `project-map.md`.
- Confirm the change is scoped and does not duplicate existing theme mechanisms.
- Confirm generated HTML has the expected structure.
- Confirm compiled CSS contains the intended selectors and no undefined Sass variables.
- Confirm page-specific scripts are only loaded on the intended page.
- Confirm accessibility state and keyboard behavior for interactive UI.
- Confirm bilingual/homepage behavior still preserves direct `CN`/`EN` links when relevant.
- Confirm `<html lang="...">` survives generated output if plugin/layout code was touched.
- Confirm `bundle exec jekyll build` passes or record why it was not run.

## Final Acceptance Rule

Do not treat a substantial task as complete until:

- the Developer checklist passes
- the Reviewer checklist has no blocking findings
- required build/preview validation has passed or a clear blocker is reported
- any deviations from the source content or user request are explicitly reported
