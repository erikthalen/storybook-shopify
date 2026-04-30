import type { ArgsStoryFn, RenderContext } from 'storybook/internal/types';
import type { ShopifyRenderer } from './types.js';
export declare function registerSnippets(map: Record<string, string>): void;
export declare function renderTemplate(template: string, context: Record<string, unknown>): string;
export declare const render: ArgsStoryFn<ShopifyRenderer>;
export declare function renderToCanvas({ storyFn, kind, name, showMain, showError }: RenderContext<ShopifyRenderer>, canvasElement: ShopifyRenderer['canvasElement']): void;
//# sourceMappingURL=render.d.ts.map