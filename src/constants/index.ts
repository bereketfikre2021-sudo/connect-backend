export const PORTFOLIO_CATEGORIES = [
  'brand-design',
  'social-media-design',
  'packaging-environmental-design',
  'print-layout',
  'web-ui-design',
] as const;

export const BLOG_STATUSES = ['draft', 'published'] as const;

export const SORT_ORDERS = ['asc', 'desc'] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
];

export const CLOUDINARY_FOLDERS = {
  HERO: 'connect-digitals/hero',
  PORTFOLIO: 'connect-digitals/portfolio',
  CASE_STUDIES: 'connect-digitals/case-studies',
  BLOG: 'connect-digitals/blog',
  TRUSTED_BRANDS: 'connect-digitals/trusted-brands',
  TESTIMONIALS: 'connect-digitals/testimonials',
  SETTINGS: 'connect-digitals/settings',
};

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
