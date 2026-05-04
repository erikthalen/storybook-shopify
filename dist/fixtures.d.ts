export declare const product: {
    id: number;
    handle: string;
    title: string;
    description: string;
    url: string;
    price: number;
    price_min: number;
    price_max: number;
    compare_at_price: number;
    compare_at_price_min: number;
    compare_at_price_max: number;
    available: boolean;
    type: string;
    vendor: string;
    tags: string[];
    featured_image: {
        src: string;
        width: number;
        height: number;
        alt: string;
    };
    images: {
        src: string;
        width: number;
        height: number;
        alt: string;
    }[];
    media: {
        src: string;
        width: number;
        height: number;
        alt: string;
        media_type: string;
    }[];
    variants: {
        id: number;
        title: string;
        price: number;
        compare_at_price: null;
        available: boolean;
        sku: string;
        option1: string;
        option2: null;
        option3: null;
        weight: number;
        featured_image: {
            src: string;
            width: number;
            height: number;
            alt: string;
        };
        url: string;
    }[];
    options: string[];
    options_with_values: {
        name: string;
        values: string[];
    }[];
    selected_or_first_available_variant: {
        id: number;
        title: string;
        price: number;
        compare_at_price: null;
        available: boolean;
        sku: string;
        option1: string;
        option2: null;
        option3: null;
        weight: number;
        featured_image: {
            src: string;
            width: number;
            height: number;
            alt: string;
        };
        url: string;
    };
    selected_variant: {
        id: number;
        title: string;
        price: number;
        compare_at_price: null;
        available: boolean;
        sku: string;
        option1: string;
        option2: null;
        option3: null;
        weight: number;
        featured_image: {
            src: string;
            width: number;
            height: number;
            alt: string;
        };
        url: string;
    };
    template_suffix: string;
    collections: never[];
};
export declare const product_variant: {
    id: number;
    title: string;
    price: number;
    compare_at_price: number;
    available: boolean;
    sku: string;
    barcode: string;
    option1: string;
    option2: string;
    option3: null;
    options: string[];
    weight: number;
    weight_unit: string;
    taxable: boolean;
    requires_shipping: boolean;
    inventory_quantity: number;
    inventory_management: string;
    inventory_policy: string;
    featured_image: {
        src: string;
        width: number;
        height: number;
        alt: string;
    };
    image: {
        src: string;
        width: number;
        height: number;
        alt: string;
    };
    url: string;
    unit_price: null;
    unit_price_measurement: null;
    selected: boolean;
    metafields: {};
    product: {
        id: number;
        handle: string;
        title: string;
        description: string;
        url: string;
        price: number;
        price_min: number;
        price_max: number;
        compare_at_price: number;
        compare_at_price_min: number;
        compare_at_price_max: number;
        available: boolean;
        type: string;
        vendor: string;
        tags: string[];
        featured_image: {
            src: string;
            width: number;
            height: number;
            alt: string;
        };
        images: {
            src: string;
            width: number;
            height: number;
            alt: string;
        }[];
        media: {
            src: string;
            width: number;
            height: number;
            alt: string;
            media_type: string;
        }[];
        variants: {
            id: number;
            title: string;
            price: number;
            compare_at_price: null;
            available: boolean;
            sku: string;
            option1: string;
            option2: null;
            option3: null;
            weight: number;
            featured_image: {
                src: string;
                width: number;
                height: number;
                alt: string;
            };
            url: string;
        }[];
        options: string[];
        options_with_values: {
            name: string;
            values: string[];
        }[];
        selected_or_first_available_variant: {
            id: number;
            title: string;
            price: number;
            compare_at_price: null;
            available: boolean;
            sku: string;
            option1: string;
            option2: null;
            option3: null;
            weight: number;
            featured_image: {
                src: string;
                width: number;
                height: number;
                alt: string;
            };
            url: string;
        };
        selected_variant: {
            id: number;
            title: string;
            price: number;
            compare_at_price: null;
            available: boolean;
            sku: string;
            option1: string;
            option2: null;
            option3: null;
            weight: number;
            featured_image: {
                src: string;
                width: number;
                height: number;
                alt: string;
            };
            url: string;
        };
        template_suffix: string;
        collections: never[];
    };
};
export declare const collection: {
    id: number;
    handle: string;
    title: string;
    description: string;
    url: string;
    image: {
        src: string;
        width: number;
        height: number;
        alt: string;
    };
    products_count: number;
    all_products_count: number;
    products: {
        id: number;
        handle: string;
        title: string;
        description: string;
        url: string;
        price: number;
        price_min: number;
        price_max: number;
        compare_at_price: number;
        compare_at_price_min: number;
        compare_at_price_max: number;
        available: boolean;
        type: string;
        vendor: string;
        tags: string[];
        featured_image: {
            src: string;
            width: number;
            height: number;
            alt: string;
        };
        images: {
            src: string;
            width: number;
            height: number;
            alt: string;
        }[];
        media: {
            src: string;
            width: number;
            height: number;
            alt: string;
            media_type: string;
        }[];
        variants: {
            id: number;
            title: string;
            price: number;
            compare_at_price: null;
            available: boolean;
            sku: string;
            option1: string;
            option2: null;
            option3: null;
            weight: number;
            featured_image: {
                src: string;
                width: number;
                height: number;
                alt: string;
            };
            url: string;
        }[];
        options: string[];
        options_with_values: {
            name: string;
            values: string[];
        }[];
        selected_or_first_available_variant: {
            id: number;
            title: string;
            price: number;
            compare_at_price: null;
            available: boolean;
            sku: string;
            option1: string;
            option2: null;
            option3: null;
            weight: number;
            featured_image: {
                src: string;
                width: number;
                height: number;
                alt: string;
            };
            url: string;
        };
        selected_variant: {
            id: number;
            title: string;
            price: number;
            compare_at_price: null;
            available: boolean;
            sku: string;
            option1: string;
            option2: null;
            option3: null;
            weight: number;
            featured_image: {
                src: string;
                width: number;
                height: number;
                alt: string;
            };
            url: string;
        };
        template_suffix: string;
        collections: never[];
    }[];
};
export declare const article: {
    id: number;
    handle: string;
    title: string;
    content: string;
    excerpt: string;
    excerpt_or_content: string;
    url: string;
    author: string;
    image: {
        src: string;
        width: number;
        height: number;
        alt: string;
    };
    published_at: string;
    created_at: string;
    tags: never[];
    comments_count: number;
    comments_enabled: boolean;
};
export declare const blog: {
    id: number;
    handle: string;
    title: string;
    url: string;
    articles_count: number;
};
export declare const page: {
    id: number;
    handle: string;
    title: string;
    content: string;
    url: string;
    author: string;
    published_at: string;
};
export declare const video: {
    id: number;
    media_type: string;
    sources: {
        url: string;
        mime_type: string;
        format: string;
        height: number;
        width: number;
    }[];
    preview_image: {
        src: string;
        width: number;
        height: number;
        alt: string;
    };
    aspect_ratio: number;
    alt: string;
};
export declare const FIXTURE_BY_SETTING_TYPE: Record<string, unknown>;
export declare const FIXTURE_BY_LIQUID_TYPE: Record<string, unknown>;
export declare const paginate: {
    current_page: number;
    current_offset: number;
    items: number;
    page_param: string;
    page_size: number;
    pages: number;
    previous: {
        is_link: boolean;
        title: string;
        url: string;
    };
    next: {
        is_link: boolean;
        title: string;
        url: string;
    };
    parts: {
        is_link: boolean;
        title: string;
        url: string;
    }[];
};
export declare const shop: {
    name: string;
    currency: string;
    money_format: string;
    email: string;
    url: string;
    secure_url: string;
    locale: string;
    permanent_domain: string;
};
export declare const routes: {
    root_url: string;
    cart_url: string;
    cart_add_url: string;
    cart_change_url: string;
    cart_update_url: string;
    cart_clear_url: string;
    account_url: string;
    account_login_url: string;
    account_logout_url: string;
    account_register_url: string;
    account_addresses_url: string;
    collections_url: string;
    products_url: string;
    search_url: string;
    predictive_search_url: string;
    all_products_collection_url: string;
};
export declare const cart: {
    item_count: number;
    total_price: number;
    items: never[];
    total_discount: number;
    note: string;
};
export declare const request: {
    locale: {
        iso_code: string;
        name: string;
        endonym_name: string;
    };
    page_type: string;
    path: string;
    host: string;
};
export declare const customer: null;
export declare const settings: Record<string, unknown>;
export declare const globalContext: Record<string, unknown>;
export declare const fixtures: {
    image: {
        src: string;
        width: number;
        height: number;
        alt: string;
    };
    product: {
        id: number;
        handle: string;
        title: string;
        description: string;
        url: string;
        price: number;
        price_min: number;
        price_max: number;
        compare_at_price: number;
        compare_at_price_min: number;
        compare_at_price_max: number;
        available: boolean;
        type: string;
        vendor: string;
        tags: string[];
        featured_image: {
            src: string;
            width: number;
            height: number;
            alt: string;
        };
        images: {
            src: string;
            width: number;
            height: number;
            alt: string;
        }[];
        media: {
            src: string;
            width: number;
            height: number;
            alt: string;
            media_type: string;
        }[];
        variants: {
            id: number;
            title: string;
            price: number;
            compare_at_price: null;
            available: boolean;
            sku: string;
            option1: string;
            option2: null;
            option3: null;
            weight: number;
            featured_image: {
                src: string;
                width: number;
                height: number;
                alt: string;
            };
            url: string;
        }[];
        options: string[];
        options_with_values: {
            name: string;
            values: string[];
        }[];
        selected_or_first_available_variant: {
            id: number;
            title: string;
            price: number;
            compare_at_price: null;
            available: boolean;
            sku: string;
            option1: string;
            option2: null;
            option3: null;
            weight: number;
            featured_image: {
                src: string;
                width: number;
                height: number;
                alt: string;
            };
            url: string;
        };
        selected_variant: {
            id: number;
            title: string;
            price: number;
            compare_at_price: null;
            available: boolean;
            sku: string;
            option1: string;
            option2: null;
            option3: null;
            weight: number;
            featured_image: {
                src: string;
                width: number;
                height: number;
                alt: string;
            };
            url: string;
        };
        template_suffix: string;
        collections: never[];
    };
    collection: {
        id: number;
        handle: string;
        title: string;
        description: string;
        url: string;
        image: {
            src: string;
            width: number;
            height: number;
            alt: string;
        };
        products_count: number;
        all_products_count: number;
        products: {
            id: number;
            handle: string;
            title: string;
            description: string;
            url: string;
            price: number;
            price_min: number;
            price_max: number;
            compare_at_price: number;
            compare_at_price_min: number;
            compare_at_price_max: number;
            available: boolean;
            type: string;
            vendor: string;
            tags: string[];
            featured_image: {
                src: string;
                width: number;
                height: number;
                alt: string;
            };
            images: {
                src: string;
                width: number;
                height: number;
                alt: string;
            }[];
            media: {
                src: string;
                width: number;
                height: number;
                alt: string;
                media_type: string;
            }[];
            variants: {
                id: number;
                title: string;
                price: number;
                compare_at_price: null;
                available: boolean;
                sku: string;
                option1: string;
                option2: null;
                option3: null;
                weight: number;
                featured_image: {
                    src: string;
                    width: number;
                    height: number;
                    alt: string;
                };
                url: string;
            }[];
            options: string[];
            options_with_values: {
                name: string;
                values: string[];
            }[];
            selected_or_first_available_variant: {
                id: number;
                title: string;
                price: number;
                compare_at_price: null;
                available: boolean;
                sku: string;
                option1: string;
                option2: null;
                option3: null;
                weight: number;
                featured_image: {
                    src: string;
                    width: number;
                    height: number;
                    alt: string;
                };
                url: string;
            };
            selected_variant: {
                id: number;
                title: string;
                price: number;
                compare_at_price: null;
                available: boolean;
                sku: string;
                option1: string;
                option2: null;
                option3: null;
                weight: number;
                featured_image: {
                    src: string;
                    width: number;
                    height: number;
                    alt: string;
                };
                url: string;
            };
            template_suffix: string;
            collections: never[];
        }[];
    };
    article: {
        id: number;
        handle: string;
        title: string;
        content: string;
        excerpt: string;
        excerpt_or_content: string;
        url: string;
        author: string;
        image: {
            src: string;
            width: number;
            height: number;
            alt: string;
        };
        published_at: string;
        created_at: string;
        tags: never[];
        comments_count: number;
        comments_enabled: boolean;
    };
    blog: {
        id: number;
        handle: string;
        title: string;
        url: string;
        articles_count: number;
    };
    page: {
        id: number;
        handle: string;
        title: string;
        content: string;
        url: string;
        author: string;
        published_at: string;
    };
    video: {
        id: number;
        media_type: string;
        sources: {
            url: string;
            mime_type: string;
            format: string;
            height: number;
            width: number;
        }[];
        preview_image: {
            src: string;
            width: number;
            height: number;
            alt: string;
        };
        aspect_ratio: number;
        alt: string;
    };
    shop: {
        name: string;
        currency: string;
        money_format: string;
        email: string;
        url: string;
        secure_url: string;
        locale: string;
        permanent_domain: string;
    };
    routes: {
        root_url: string;
        cart_url: string;
        cart_add_url: string;
        cart_change_url: string;
        cart_update_url: string;
        cart_clear_url: string;
        account_url: string;
        account_login_url: string;
        account_logout_url: string;
        account_register_url: string;
        account_addresses_url: string;
        collections_url: string;
        products_url: string;
        search_url: string;
        predictive_search_url: string;
        all_products_collection_url: string;
    };
    cart: {
        item_count: number;
        total_price: number;
        items: never[];
        total_discount: number;
        note: string;
    };
    request: {
        locale: {
            iso_code: string;
            name: string;
            endonym_name: string;
        };
        page_type: string;
        path: string;
        host: string;
    };
    product_variant: {
        id: number;
        title: string;
        price: number;
        compare_at_price: number;
        available: boolean;
        sku: string;
        barcode: string;
        option1: string;
        option2: string;
        option3: null;
        options: string[];
        weight: number;
        weight_unit: string;
        taxable: boolean;
        requires_shipping: boolean;
        inventory_quantity: number;
        inventory_management: string;
        inventory_policy: string;
        featured_image: {
            src: string;
            width: number;
            height: number;
            alt: string;
        };
        image: {
            src: string;
            width: number;
            height: number;
            alt: string;
        };
        url: string;
        unit_price: null;
        unit_price_measurement: null;
        selected: boolean;
        metafields: {};
        product: {
            id: number;
            handle: string;
            title: string;
            description: string;
            url: string;
            price: number;
            price_min: number;
            price_max: number;
            compare_at_price: number;
            compare_at_price_min: number;
            compare_at_price_max: number;
            available: boolean;
            type: string;
            vendor: string;
            tags: string[];
            featured_image: {
                src: string;
                width: number;
                height: number;
                alt: string;
            };
            images: {
                src: string;
                width: number;
                height: number;
                alt: string;
            }[];
            media: {
                src: string;
                width: number;
                height: number;
                alt: string;
                media_type: string;
            }[];
            variants: {
                id: number;
                title: string;
                price: number;
                compare_at_price: null;
                available: boolean;
                sku: string;
                option1: string;
                option2: null;
                option3: null;
                weight: number;
                featured_image: {
                    src: string;
                    width: number;
                    height: number;
                    alt: string;
                };
                url: string;
            }[];
            options: string[];
            options_with_values: {
                name: string;
                values: string[];
            }[];
            selected_or_first_available_variant: {
                id: number;
                title: string;
                price: number;
                compare_at_price: null;
                available: boolean;
                sku: string;
                option1: string;
                option2: null;
                option3: null;
                weight: number;
                featured_image: {
                    src: string;
                    width: number;
                    height: number;
                    alt: string;
                };
                url: string;
            };
            selected_variant: {
                id: number;
                title: string;
                price: number;
                compare_at_price: null;
                available: boolean;
                sku: string;
                option1: string;
                option2: null;
                option3: null;
                weight: number;
                featured_image: {
                    src: string;
                    width: number;
                    height: number;
                    alt: string;
                };
                url: string;
            };
            template_suffix: string;
            collections: never[];
        };
    };
    paginate: {
        current_page: number;
        current_offset: number;
        items: number;
        page_param: string;
        page_size: number;
        pages: number;
        previous: {
            is_link: boolean;
            title: string;
            url: string;
        };
        next: {
            is_link: boolean;
            title: string;
            url: string;
        };
        parts: {
            is_link: boolean;
            title: string;
            url: string;
        }[];
    };
};
//# sourceMappingURL=fixtures.d.ts.map