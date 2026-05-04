import { describe, it, expect } from 'vitest';
import { product_variant, globalContext, FIXTURE_BY_LIQUID_TYPE, fixtures, } from './fixtures.js';
describe('product_variant fixture', () => {
    it('has required Shopify variant fields', () => {
        expect(product_variant).toMatchObject({
            id: expect.any(Number),
            title: expect.any(String),
            price: expect.any(Number),
            available: expect.any(Boolean),
            sku: expect.any(String),
            barcode: expect.any(String),
            option1: expect.any(String),
            options: expect.any(Array),
            weight: expect.any(Number),
            weight_unit: expect.any(String),
            taxable: expect.any(Boolean),
            requires_shipping: expect.any(Boolean),
            inventory_quantity: expect.any(Number),
            inventory_management: expect.any(String),
            inventory_policy: expect.any(String),
            url: expect.any(String),
            selected: expect.any(Boolean),
        });
    });
    it('is in globalContext as both "variant" and "product_variant"', () => {
        expect(globalContext.variant).toBe(product_variant);
        expect(globalContext.product_variant).toBe(product_variant);
    });
    it('is in FIXTURE_BY_LIQUID_TYPE as both "variant" and "product_variant"', () => {
        expect(FIXTURE_BY_LIQUID_TYPE.variant).toBe(product_variant);
        expect(FIXTURE_BY_LIQUID_TYPE.product_variant).toBe(product_variant);
    });
    it('is in the public fixtures export', () => {
        expect(fixtures.product_variant).toBe(product_variant);
    });
});
//# sourceMappingURL=fixtures.test.js.map