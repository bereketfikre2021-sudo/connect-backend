import { body } from 'express-validator';

export const createBlogValidators = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('content').notEmpty().withMessage('Content required'),
  body('slug').optional().trim().toLowerCase(),
  body('excerpt').optional().trim(),
  body('category').optional().trim(),
  // tags arrives as a JSON string from FormData — parsed in the controller
  body('tags').optional(),
  body('author').optional().trim(),
  body('readingTime')
    .optional({ checkFalsy: true })
    .toInt()
    .custom((v) => { if (!isNaN(v) && v < 1) throw new Error('Reading time must be at least 1'); return true; }),
  body('status').optional().isIn(['draft', 'published', 'scheduled']),
  // FormData sends booleans as "true"/"false"/"on" strings
  body('published').optional().isBoolean({ strict: false }).toBoolean(),
  body('publishedAt').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('scheduledAt').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('displayOrder')
    .optional({ checkFalsy: true })
    .toInt()
    .custom((v) => { if (!isNaN(v) && v < 0) throw new Error('Display order must be 0 or greater'); return true; }),
  body('seoTitle').optional().trim(),
  body('seoDescription').optional().trim(),
];

export const updateBlogValidators = [...createBlogValidators];
