import type { PresetsInfo } from "./schema-parser.js";
export declare function shouldSkipLiquidFile(filename: string): boolean;
export declare function buildAutoTitle(dir: string, filename: string): string;
export declare function buildAutoStory(dir: string, filename: string, liquidRelPath: string, defaults: Record<string, unknown>, presetsInfo: PresetsInfo | null): string;
//# sourceMappingURL=auto-story-builder.d.ts.map