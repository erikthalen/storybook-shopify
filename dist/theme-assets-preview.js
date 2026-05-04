import { SCRIPTS, STYLES } from 'virtual:storybook-shopify-theme-assets-config';
for (const href of STYLES) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
}
for (const src of SCRIPTS) {
    const s = document.createElement('script');
    s.type = 'module';
    s.src = src;
    document.head.appendChild(s);
}
//# sourceMappingURL=theme-assets-preview.js.map