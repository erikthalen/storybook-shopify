import type { StorybookConfig as StorybookConfigBase, WebRenderer, StoryContext as DefaultStoryContext, ArgsStoryFn } from 'storybook/internal/types';
import type { BuilderOptions, StorybookConfigVite } from '@storybook/builder-vite';
export type { RenderContext } from 'storybook/internal/types';
export type StoryFnShopifyReturnType = string;
export interface ShopifyRenderer extends WebRenderer {
    component: string | ArgsStoryFn<ShopifyRenderer>;
    storyResult: StoryFnShopifyReturnType;
}
export type StoryContext = DefaultStoryContext<ShopifyRenderer>;
type FrameworkName = 'storybook-shopify';
type BuilderName = '@storybook/builder-vite';
export type FrameworkOptions = {
    builder?: BuilderOptions;
    /** Parse {% doc %} blocks and generate argTypes automatically. */
    renderDocTags?: boolean;
};
type StorybookConfigFramework = {
    framework: FrameworkName | {
        name: FrameworkName;
        options?: FrameworkOptions;
    };
    core?: StorybookConfigBase['core'] & {
        builder?: BuilderName | {
            name: BuilderName;
            options: BuilderOptions;
        };
    };
};
export type StorybookConfig = Omit<StorybookConfigBase, keyof StorybookConfigVite | keyof StorybookConfigFramework> & StorybookConfigVite & StorybookConfigFramework;
//# sourceMappingURL=types.d.ts.map