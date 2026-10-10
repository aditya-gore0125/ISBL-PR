import { z } from 'zod';
import { PRODUCT_CATEGORIES_BY_TYPE, PRODUCT_TYPES } from '@/lib/productOptions';
import { getSizeOptions } from '@/lib/sizeConfig';

const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  phone: z.string().trim().max(20).optional().default(''),
  password: z.string().min(8).max(128),
}).strict();

const addressSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/),
  addressLine1: z.string().trim().min(1).max(200),
  addressLine2: z.string().trim().max(200).optional().default(''),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/),
  isDefault: z.boolean().optional().default(false),
}).strict();

const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(20),
}).strict();

export const accountSchema = z.object({
  profile: profileSchema.optional(),
  addresses: z.array(addressSchema).max(10).optional(),
}).strict().refine((value) => Boolean(value.profile || value.addresses), {
  message: 'Provide profile or addresses.',
}).refine((value) => !value.addresses || value.addresses.filter((address) => address.isDefault).length <= 1, {
  message: 'Only one address may be marked as default.',
});

const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/),
  addressLine1: z.string().trim().min(1).max(200),
  addressLine2: z.string().trim().max(200).optional().default(''),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/),
  isDefault: z.boolean().optional(),
}).strict();

const checkoutItemsSchema = z.array(z.object({
  productId: z.string().regex(/^[a-f\d]{24}$/i),
  quantity: z.number().int().min(1).max(20),
  size: z.string().min(1).max(20).nullable().optional(),
}).strict()).min(1).max(50);

export const checkoutSchema = z.object({ items: checkoutItemsSchema }).strict();

export const createOrderSchema = z.object({
  razorpay_order_id: z.string().trim().min(1).max(100),
  razorpay_payment_id: z.string().trim().min(1).max(200),
  razorpay_signature: z.string().regex(/^[a-f\d]{64}$/i),
  shippingAddress: shippingAddressSchema,
  items: checkoutItemsSchema,
}).strict();

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5).max(1000),
}).strict();

export const contactInquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  phone: z.string().trim().max(30).regex(/^[+\d()\s-]*$/).optional().default(''),
  subject: z.enum([
    'General Inquiry',
    'Bridal Consultation',
    'Order & Delivery Status',
    'Custom Sizing & Design',
    'Bulk & Festive Gifting',
  ]),
  message: z.string().trim().min(1).max(5000),
}).strict();

export const newsletterSchema = z.object({ email: emailSchema }).strict();
export const uploadSchema = z.object({
  image: z.custom((value) => value && typeof value.arrayBuffer === 'function' && typeof value.type === 'string'),
}).strict();

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(120).optional(),
  type: z.enum(['Ladies', 'Gents']).optional().default('Ladies'),
  image: z.string().trim().max(2048).optional().default(''),
  displayOrder: z.coerce.number().int().min(0).max(100000).optional().default(0),
}).strict();

export const categoryUpdateSchema = categoryCreateSchema.partial().strict();

const productReviewSchema = z.object({
  user: z.string().optional(),
  name: z.string().trim().min(1).max(100),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(1000),
  createdAt: z.coerce.date().optional(),
}).strict();

const productFields = {
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180),
  type: z.enum(PRODUCT_TYPES),
  category: z.string().trim().min(1).max(100),
  description: z.string().max(10000).optional().default(''),
  material: z.string().trim().max(100).optional().default(''),
  price: z.coerce.number().finite().min(0),
  discountPrice: z.coerce.number().finite().min(0).optional().default(0),
  images: z.array(z.string().trim().min(1).max(2048)).max(30).optional().default([]),
  stock: z.coerce.number().int().min(0).max(1000000).optional().default(0),
  sizes: z.array(z.object({
    size: z.string().min(1).max(20),
    stock: z.coerce.number().int().min(0).max(1000000),
  }).strict()).max(20).optional(),
  isFeatured: z.boolean().optional().default(false),
  isNewArrival: z.boolean().optional().default(false),
  rating: z.coerce.number().finite().min(0).max(5).optional().default(0),
  numReviews: z.coerce.number().int().min(0).max(1000000).optional().default(0),
  reviews: z.array(productReviewSchema).max(1000).optional().default([]),
  metaTitle: z.string().trim().max(200).optional().default(''),
  metaDescription: z.string().trim().max(500).optional().default(''),
};

function validateProductCategory(value, context, requireSizes = false) {
  if (value.category) {
    const validCategories = value.type
      ? PRODUCT_CATEGORIES_BY_TYPE[value.type] || []
      : Object.values(PRODUCT_CATEGORIES_BY_TYPE).flat();
    if (!validCategories.includes(value.category)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['category'], message: 'Product category is invalid.' });
      return;
    }
  }

  if (!value.type || !value.category || value.sizes === undefined) {
    if (requireSizes && value.type && value.category && getSizeOptions(value.type, value.category)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['sizes'], message: 'Stock for every available size is required.' });
    }
    return;
  }

  const allowedSizes = getSizeOptions(value.type, value.category);
  const sizes = value.sizes || [];
  if (!allowedSizes) {
    if (sizes.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['sizes'], message: 'This product category does not support sizes.' });
    return;
  }

  const submittedSizes = sizes.map(({ size }) => size);
  if (new Set(submittedSizes).size !== submittedSizes.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['sizes'], message: 'Duplicate sizes are not allowed.' });
  }
  if (submittedSizes.some((size) => !allowedSizes.includes(size))) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['sizes'], message: 'One or more sizes are not allowed for this category.' });
  }
  if (requireSizes && (submittedSizes.length !== allowedSizes.length
    || allowedSizes.some((size) => !submittedSizes.includes(size)))) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['sizes'], message: 'Stock for every available size is required.' });
  }
}

export const productCreateSchema = z.object(productFields).strict().superRefine((value, context) => validateProductCategory(value, context, true));
export const productUpdateSchema = z.object(productFields).partial().strict().superRefine(validateProductCategory);

export const adminOrderUpdateSchema = z.object({
  orderStatus: z.enum(['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']),
  trackingId: z.string().trim().max(100).optional(),
  courierPartner: z.string().trim().max(80).optional(),
}).strict();

export const credentialSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
}).strict();

export const credentialFormSchema = credentialSchema.extend({
  csrfToken: z.string().max(256).optional(),
  callbackUrl: z.string().max(2048).optional(),
  json: z.enum(['true', 'false']).optional(),
}).strict();