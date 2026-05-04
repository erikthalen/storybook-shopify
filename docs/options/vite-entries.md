# viteEntries

**Type:** `string[]`  
**Default:** `[]`

A list of entry files (relative to your theme's `src/` directory) whose compiled output should be loaded in the Storybook preview iframe. Use this when your templates depend on JavaScript or CSS that is built by Vite — for example a theme bundle that needs to be present for components to render correctly.

The framework resolves each entry against the built `assets/manifest.json` and injects the resulting scripts and stylesheets into the preview.

> [!WARNING]
> This option reads compiled files from your theme's `assets/` folder, not from `src/`. Make sure to build your theme assets before starting Storybook, otherwise the entries will not be found.

```ts
framework: {
  name: 'storybook-shopify',
  options: {
    viteEntries: ['theme.js', 'theme.css'],
  },
},
```

Use the `prebuild` convention in `package.json` to ensure assets are compiled before Storybook starts:

```json
{
  "scripts": {
    "prestorybook": "vite build",
    "storybook": "storybook dev -p 6006"
  }
}
```
