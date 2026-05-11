---
layout: article
title: "Feature Test Page"
date: 2025-12-25
key: hello-world-2025
# bilingual: true
lang: en
hidden: true
# published: False
# tags: [Demo]
---

This is the English content.

This is a test for bilingual blog support. You should see language toggle buttons below the title.

If you see this post in the main list, you should see the EN/CN badge.

---

This document demonstrates the various custom content blocks supported by the blog theme and how to use them. Every style includes source code examples and the actual rendered result.

## 1. Basic Blocks

Supports four basic state colors: Standard, Success, Info, Warning, Error.

### HTML Syntax

Use `<div class="*-block" markdown="1">` (Note that `markdown="1"` is required for processing internal MD content).

**Source Example:**

````markdown
<!-- Normal/Default -->
<div class="neutral-block" markdown="1">
<div class="block-title">Neutral Block</div>
This is a default style block.
</div>

<!-- Success/Green -->
<div class="success-block" markdown="1">
<div class="block-title">Success Block</div>
Operation successful.
</div>

<!-- Info/Blue -->
<div class="info-block" markdown="1">
<div class="block-title">Info Block</div>
General information.
</div>

<!-- Warning/Yellow -->
<div class="warning-block" markdown="1">
<div class="block-title">Warning Block</div>
Warning message.
</div>

<!-- Error/Red -->
<div class="error-block" markdown="1">
<div class="block-title">Error Block</div>
Error or dangerous operation.
</div>
````

**Rendered Result:**

<div class="neutral-block" markdown="1">
<div class="block-title">Neutral Block</div>
This is a default style block.
</div>

<div class="success-block" markdown="1">
<div class="block-title">Success Block</div>
Operation successful.
</div>

<div class="info-block" markdown="1">
<div class="block-title">Info Block</div>
General information.
</div>

<div class="warning-block" markdown="1">
<div class="block-title">Warning Block</div>
Warning message.
</div>

<div class="error-block" markdown="1">
<div class="block-title">Error Block</div>
Error or dangerous operation.
</div>

### Liquid Tag Syntax

Use `{% raw %}{% plain type title="..." %}{% endraw %}`.

**Source Example:**

````liquid
{% raw %}
{% plain success title="Liquid Success" %}
This is a block generated using Liquid tags.
{% endplain %}

{% plain error title="Liquid Error" %}
This is an error block generated using Liquid tags.
{% endplain %}
{% endraw %}
````

**Rendered Result:**

{% plain success title="Liquid Success" %}
This is a block generated using Liquid tags.
{% endplain %}

{% plain error title="Liquid Error" %}
This is an error block generated using Liquid tags.
{% endplain %}

---

## 2. Academic Blocks

Supports common academic environment definitions: `proof`, `theorem`, `lemma`, `proposition`, `definition`, `example`, `remark`, `note`, `solution`.

### Basic Usage (Default Block Title)

**HTML Source:**

````markdown
<div class="theorem" markdown="1">
This is a theorem.
</div>

<div class="proof" markdown="1">
This is a proof.
</div>
````

**Liquid Source:**

````liquid
{% raw %}
{% theorem %}
This is a theorem (Liquid).
{% endtheorem %}
{% endraw %}
````

**Rendered Result:**

<div class="theorem" markdown="1">
This is a theorem.
</div>

<div class="proof" markdown="1">
This is a proof.
</div>

### Inline Title Style

Add `inline` class or parameter.

**Source:**

````markdown
<div class="proof inline" markdown="1">
Title and content are on the same line.
</div>

{% raw %}
{% note inline %}
Note: This is a note with an inline title.
{% endnote %}
{% endraw %}
````

**Rendered Result:**

<div class="proof inline" markdown="1">
Title and content are on the same line.
</div>

{% note inline %}
Note: This is a note with an inline title.
{% endnote %}

### Custom Title

Use `data-title` attribute or `title` parameter.

**Source:**

````markdown
<div class="lemma" data-title="Zorn's Lemma" markdown="1">
Every non-empty partially ordered set has a maximal element...
</div>

{% raw %}
{% proposition title="My Proposition" %}
This is a proposition with a custom title.
{% endproposition %}
{% endraw %}
````

**Rendered Result:**

<div class="lemma" data-title="Zorn's Lemma" markdown="1">
Every non-empty partially ordered set has a maximal element...
</div>

{% proposition title="My Proposition" %}
This is a proposition with a custom title.
{% endproposition %}

---

## 3. Collapsible Blocks

### HTML Syntax (`details` & `summary`)

**Source:**

````markdown
<details class="info" markdown="1">
<summary data-title="Click to expand details"></summary>
Here is the hidden detailed content.
</details>
````

**Rendered Result:**

<details class="info" markdown="1">
<summary data-title="Click to expand details"></summary>
Here is the hidden detailed content.
</details>

### Liquid Syntax (`fold` parameter)

**Source:**

````liquid
{% raw %}
{% example fold title="View Code Example" %}
```python
print("Hidden Code")
```
{% endexample %}
{% endraw %}
````

**Rendered Result:**

{% example fold title="View Code Example" %}
```python
print("Hidden Code")
```
{% endexample %}

---

## 4. Code Block Enhancements

Supports adding titles, default fold states, and special styles to code blocks.

### Code Blocks with Titles

Add `{: title="..." }` below the code block.

**Source:**

````markdown
```python
def main():
    pass
```
{: title="main.py" }
````

**Rendered Result:**

```python
def main():
    pass
```
{: title="main.py" }

### Default Folded Code Blocks

Use `fold="true"` (default folded) or `fold="open"` (default expanded).

**Source:**

````markdown
```javascript
// Long code folded
const bigFile = "...";
```
{: title="config.js" fold="true" }
````

**Rendered Result:**

```javascript
// Long code folded
const bigFile = "...";
```
{: title="config.js" fold="true" }

### Semantic Color Code Blocks

Use `type="..."` parameter. Supports `example` (green), `exploit` (blue), `error` (red).

**Source:**

````markdown
```bash
# This is a correct example
npm install
```
{: type="example" }

```c
// This is an exploit code
char buf[10];
strcpy(buf, input);
```
{: type="exploit" title="vulnerable.c" }

```bash
# This is an error operation
rm -rf /
```
{: type="error" }
````

**Rendered Result:**

```bash
# This is a correct example
npm install
```
{: type="example" }

```c
// This is an exploit code
char buf[10];
strcpy(buf, input);
```
{: type="exploit" title="vulnerable.c" }

```bash
# This is an error operation
rm -rf /
```
{: type="error" }

### Liquid Code Block Wrapper

**Source:**

````liquid
{% raw %}
{% code_block success fold title="Wrapped Code" %}
```python
print("Wrapped in Liquid")
```
{% endcode_block %}
{% endraw %}
````

**Rendered Result:**

{% code_block success fold title="Wrapped Code" %}
```python
print("Wrapped in Liquid")
```
{% endcode_block %}
