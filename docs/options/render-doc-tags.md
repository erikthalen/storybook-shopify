# renderDocTags

**Type:** `boolean`  
**Default:** `true`

Parses `{% doc %}` and `{% schema %}` blocks in your Liquid files and automatically generates Storybook `argTypes` from them. This lets you control your story's args directly from the component's own schema without writing argTypes by hand.

Set to `false` to disable this behaviour and manage argTypes manually.

```ts
framework: {
  name: 'storybook-shopify',
  options: {
    renderDocTags: false,
  },
},
```
