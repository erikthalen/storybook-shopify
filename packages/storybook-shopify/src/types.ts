import type {
  StorybookConfig as StorybookConfigBase,
  WebRenderer,
  StoryContext as DefaultStoryContext,
  ArgsStoryFn,
} from 'storybook/internal/types';
import type { BuilderOptions, StorybookConfigVite } from '@storybook/builder-vite';

export type { RenderContext } from 'storybook/internal/types';

export type StoryFnShopifyReturnType = string;

export interface ShopifyRenderer extends WebRenderer {
  component: string | ArgsStoryFn<ShopifyRenderer>;
  storyResult: StoryFnShopifyReturnType;
}

export type StoryContext = DefaultStoryContext<ShopifyRenderer>;

// StorybookConfig type users import in their main.ts
type FrameworkName = 'storybook-shopify';
type BuilderName = '@storybook/builder-vite';

export type FrameworkOptions = {
  builder?: BuilderOptions;
  /** Parse {% doc %} and {% schema %} blocks and generate argTypes automatically. Defaults to true. */
  renderDocTags?: boolean;
  /** Entry files (relative to src/) to load in the preview iframe from the built assets. */
  viteEntries?: string[];
  /**
   * Auto-generates a basic story for every .liquid file found in sections/, snippets/, and blocks/
   * (files prefixed with _ are skipped). Stories are written to .storybook/.auto/ on each startup.
   * Set to false to disable. Defaults to true.
   */
  generateAutomaticStories?: boolean;
};

type StorybookConfigFramework = {
  framework:
    | FrameworkName
    | {
        name: FrameworkName;
        options?: FrameworkOptions;
      };
  core?: StorybookConfigBase['core'] & {
    builder?:
      | BuilderName
      | {
          name: BuilderName;
          options: BuilderOptions;
        };
  };
};

export type StorybookConfig = Omit<
  StorybookConfigBase,
  keyof StorybookConfigVite | keyof StorybookConfigFramework
> &
  StorybookConfigVite &
  StorybookConfigFramework;
