export const PRODUCT_TYPES = ['Ladies', 'Gents'];

export const PRODUCT_CATEGORIES_BY_TYPE = {
  Ladies: [
    'Earrings',
    'Mangalsutra Pendant',
    'Mangalsutra Chain',
    'Mangalsutra Set',
    'Necklace',
    'Bangles',
    'Rings',
    'Bracelet',
    'Chains',
    'Nath',
    'Hair Accessories',
    'Others',
  ],
  Gents: ['Chain', 'Bracelet', 'Kada', 'Rings', 'Earring', 'Others'],
};

export const PRODUCT_CATEGORIES = PRODUCT_TYPES.flatMap((type) => PRODUCT_CATEGORIES_BY_TYPE[type]);
