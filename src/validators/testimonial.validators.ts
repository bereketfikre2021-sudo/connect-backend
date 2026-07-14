import { body } from 'express-validator';

export const createTestimonialValidators = [
  body('clientName').trim().notEmpty().withMessage('Client name required'),
  body('review').trim().notEmpty().withMessage('Review required'),
  body('position').optional().trim(),
  body('company').optional().trim(),
  body('href').optional({ nullable: true, checkFalsy: true }).trim().isURL().withMessage('Link must be a valid URL'),
  body('rating')
    .optional({ checkFalsy: true })
    .toInt()
    .custom((v) => {
      if (isNaN(v)) return true;
      if (v < 1 || v > 5) throw new Error('Rating must be between 1 and 5');
      return true;
    }),
  body('featured').optional().isBoolean({ strict: false }).toBoolean(),
  body('published').optional().isBoolean({ strict: false }).toBoolean(),
  body('displayOrder')
    .optional({ checkFalsy: true })
    .toInt()
    .custom((v) => { if (!isNaN(v) && v < 0) throw new Error('Display order must be 0 or greater'); return true; }),
];

export const updateTestimonialValidators = [...createTestimonialValidators];
