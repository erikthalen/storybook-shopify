// Built-in Shopify fixture objects for use in Storybook previews.
// Import and spread to create custom variants: { ...fixtures.product, title: 'My Product' }
const image = {
    src: "https://placehold.co/800x600",
    width: 800,
    height: 600,
    alt: "",
};
const image2 = {
    src: "https://placehold.co/1200x1200",
    width: 1200,
    height: 1200,
    alt: "",
};
const variant = {
    id: 1,
    title: "Default Title",
    price: 2999,
    compare_at_price: null,
    available: true,
    sku: "SKU-001",
    option1: "Default Title",
    option2: null,
    option3: null,
    weight: 0,
    featured_image: null,
    url: "/products/example-product?variant=1",
};
const variant2 = {
    id: 2,
    title: "Default Title 2",
    price: 3999,
    compare_at_price: null,
    available: true,
    sku: "SKU-002",
    option1: "Default Title 2",
    option2: null,
    option3: null,
    weight: 0,
    featured_image: null,
    url: "/products/example-product?variant=2",
};
export const product = {
    id: 1,
    handle: "example-product",
    title: "Example Product",
    description: "<p>A sample product description for Storybook preview.</p>",
    url: "/products/example-product",
    price: 2999,
    price_min: 2999,
    price_max: 5999,
    compare_at_price: 3999,
    compare_at_price_min: 3999,
    compare_at_price_max: 3999,
    available: true,
    type: "Example Type",
    vendor: "Example Vendor",
    tags: ["example", "storybook"],
    featured_image: image,
    images: [image, image2],
    media: [
        { media_type: "image", ...image },
        { media_type: "image", ...image2 },
    ],
    variants: [variant, variant2],
    options: ["Title"],
    options_with_values: [
        { name: "Title", values: ["Default Title", "Default Title 2"] },
    ],
    selected_or_first_available_variant: variant,
    selected_variant: variant,
    template_suffix: "",
    collections: [],
};
export const collection = {
    id: 1,
    handle: "example-collection",
    title: "Example Collection",
    description: "<p>A sample collection for Storybook preview.</p>",
    url: "/collections/example-collection",
    image,
    products_count: 4,
    all_products_count: 4,
    products: [product, product, product, product],
};
export const article = {
    id: 1,
    handle: "example-article",
    title: "Example Article",
    content: "<p>Article content goes here.</p>",
    excerpt: "A brief excerpt of the article.",
    excerpt_or_content: "<p>Article content goes here.</p>",
    url: "/blogs/news/example-article",
    author: "Author Name",
    image,
    published_at: "2024-01-15T12:00:00Z",
    created_at: "2024-01-15T12:00:00Z",
    tags: [],
    comments_count: 0,
    comments_enabled: false,
};
export const blog = {
    id: 1,
    handle: "news",
    title: "News",
    url: "/blogs/news",
    articles_count: 3,
};
export const page = {
    id: 1,
    handle: "example-page",
    title: "Example Page",
    content: "<p>Page content goes here.</p>",
    url: "/pages/example-page",
    author: "Author Name",
    published_at: "2024-01-15T12:00:00Z",
};
export const video = {
    id: 1,
    media_type: "video",
    sources: [
        { url: "", mime_type: "video/mp4", format: "mp4", height: 480, width: 640 },
    ],
    preview_image: image,
    aspect_ratio: 1.7778,
    alt: "",
};
// Maps Shopify schema setting types → fixture values.
// Used by parseSchemaDefaults to inject sensible defaults for resource pickers.
export const FIXTURE_BY_SETTING_TYPE = {
    image_picker: image,
    video,
    article,
    article_list: [article],
    blog,
    collection,
    collection_list: [collection],
    product,
    product_list: [product],
    page,
    metaobject: {},
    metaobject_list: [],
};
// Maps Liquid object type names (as written in {% doc %} @param annotations) → fixture values.
// Used by parseDocDefaults to inject sensible defaults for snippet params.
export const FIXTURE_BY_LIQUID_TYPE = {
    image,
    product,
    product_list: [product],
    collection,
    collection_list: [collection],
    article,
    article_list: [article],
    blog,
    page,
    video,
    object: {},
};
// --- Shopify global object stubs ---
export const shop = {
    name: "My Store",
    currency: "USD",
    money_format: "${{amount}}",
    email: "contact@example.com",
    url: "https://example.myshopify.com",
    secure_url: "https://example.myshopify.com",
    locale: "en",
    permanent_domain: "example.myshopify.com",
};
export const routes = {
    root_url: "/",
    cart_url: "/cart",
    cart_add_url: "/cart/add",
    cart_change_url: "/cart/change",
    cart_update_url: "/cart/update",
    cart_clear_url: "/cart/clear",
    account_url: "/account",
    account_login_url: "/account/login",
    account_logout_url: "/account/logout",
    account_register_url: "/account/register",
    account_addresses_url: "/account/addresses",
    collections_url: "/collections",
    products_url: "/products",
    search_url: "/search",
    predictive_search_url: "/search/suggest",
    all_products_collection_url: "/collections/all",
};
export const cart = {
    item_count: 0,
    total_price: 0,
    items: [],
    total_discount: 0,
    note: "",
};
export const request = {
    locale: { iso_code: "en", name: "English", endonym_name: "English" },
    page_type: "index",
    path: "/",
    host: "example.myshopify.com",
};
// Null by default — templates typically guard with {% if customer %}
export const customer = null;
// Theme settings — theme-specific, intentionally left empty so templates
// degrade gracefully. Override per-story when needed.
export const settings = {};
// Injected as the base Liquid context for every rendered template.
// Story args are merged on top, so they always win over these fallbacks.
export const globalContext = {
    product,
    collection,
    collections: [collection],
    article,
    blog,
    page,
    shop,
    routes,
    cart,
    request,
    customer,
    settings,
};
// Public API — import these in stories to build custom fixtures via spread.
export const fixtures = {
    image,
    product,
    collection,
    article,
    blog,
    page,
    video,
    shop,
    routes,
    cart,
    request,
};
//# sourceMappingURL=fixtures.js.map