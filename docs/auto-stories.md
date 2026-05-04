# Auto Stories

`storybook-shopify` is designed to be install-and-forget. Drop it into a Shopify theme and every Liquid template in `sections/`, `snippets/`, and `blocks/` gets a story automatically — no configuration required.

The framework reads the same `{% schema %}` and `{% doc %}` blocks that Shopify uses natively to document sections and snippets. This means writing good theme documentation and having working Storybook stories are the same task — you get both for the price of one.

## How it works

On each Storybook start, the framework scans those three directories and writes a `.stories.js` file for each `.liquid` file it finds. The generated files land in `.storybook/.auto/`, which is wiped and rebuilt every run so it always reflects the current state of your theme.

**Story titles** are derived from the file's location and name:

| File | Story title |
|------|-------------|
| `sections/announcement-bar.liquid` | `Sections/Announcement Bar` |
| `snippets/icon-arrow.liquid` | `Snippets/Icon Arrow` |
| `blocks/text.liquid` | `Blocks/Text` |

**Args for sections and blocks** are populated from the `{% schema %}` block. Settings with a `default` value are used as-is; settings without one get a sensible fixture value based on their type.

**Args for snippets** come from `@param` tags inside a `{% doc %}` block. Each param becomes a Storybook arg, with the type controlling the control shown in the UI:

```liquid
{% doc %}
  @param {string} title - The heading text
  @param {string} [subtitle] - Optional subheading
  @param {boolean} show_divider - Whether to show a divider below the heading
{% enddoc %}

<div class="section-header">
  <h2>{{ title }}</h2>
  {% if subtitle != blank %}
    <p>{{ subtitle }}</p>
  {% endif %}
  {% if show_divider %}
    <hr>
  {% endif %}
</div>
```

Wrapping a param name in brackets (`[subtitle]`) marks it as optional.

**Presets** defined in `{% schema %}` become individual story exports — one story per preset, named after the preset.

## Skipping files

Prefix a file with `_` to exclude it from auto-generation:

```
sections/_private-helper.liquid  → skipped
sections/hero.liquid             → auto story generated
```

## Coexisting with manual stories

If you write a manual story file with the same title as an auto-generated one, the auto-generated story is skipped for that file. This lets you take over individual components without disabling the feature globally.

## Template context

The render context passed to each template matches how Shopify exposes data at runtime:

| Directory | Context |
|-----------|---------|
| `sections/` | `{ section: { settings: args } }` |
| `blocks/` | `{ block: { settings: args } }` |
| `snippets/` | `args` |

## Disabling

Auto story generation can be turned off via the [`generateAutomaticStories`](/options/generate-automatic-stories) option.
