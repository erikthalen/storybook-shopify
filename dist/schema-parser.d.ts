import type { InputType } from 'storybook/internal/types';
export declare function parseSchemaDefaults(template: string): Record<string, unknown>;
export declare function parseSchemaArgTypes(template: string): Record<string, InputType>;
export interface ResolvedPreset {
    name: string;
    blocks?: Array<{
        type: string;
        settings: Record<string, unknown>;
    }>;
}
export interface PresetsInfo {
    presets: ResolvedPreset[];
    hasBlocks: boolean;
}
export declare function parsePresets(template: string): PresetsInfo | null;
//# sourceMappingURL=schema-parser.d.ts.map