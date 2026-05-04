# generateAutomaticStories

**Type:** `boolean`  
**Default:** `true`

Automatically generates a basic story for every `.liquid` file found in `sections/`, `snippets/`, and `blocks/`. Stories are written to `.storybook/.auto/` each time Storybook starts, using any defaults defined in the file's `{% schema %}` block.

Files prefixed with `_` are skipped. If you have already written a manual story with the same title, the automatic one is omitted for that file.

Set to `false` to disable auto-generation entirely and rely solely on hand-written stories.

```ts
framework: {
  name: 'storybook-shopify',
  options: {
    generateAutomaticStories: false,
  },
},
```
