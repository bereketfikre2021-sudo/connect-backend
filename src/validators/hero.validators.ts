import { body } from 'express-validator';

export const createHeroValidators = [
  body('headline').optional().trim().escape(),
  body('subheadline').optional().trim().escape(),
  body('buttonText').optional().trim().escape(),
  // Only validate URL format when the field is actually filled in
  body('buttonUrl')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Button URL must be a valid URL'),
  body('altText').optional().trim().escape(),
  // toInt() first, then guard against NaN with a custom check
  body('autoSlideDelay')
    .optional({ checkFalsy: true })
    .toInt()
    .custom((v) => {
      if (isNaN(v)) return true; // empty → skip
      if (v < 1000 || v > 30000) throw new Error('Slide delay must be between 1000 and 30000ms');
      return true;
    }),
  body('displayOrder')
    .optional({ checkFalsy: true })
    .toInt()
    .custom((v) => {
      if (isNaN(v)) return true;
      if (v < 0) throw new Error('Display order must be 0 or greater');
      return true;
    }),
  body('published').optional().isBoolean({ strict: false }).toBoolean(),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
];

export const updateHeroValidators = [...createHeroValidators];

export const reorderValidators = [
  body('items').isArray({ min: 1 }).withMessage('Items array required'),
  body('items.*.id').notEmpty().withMessage('Each item must have an id'),
  body('items.*.displayOrder').isInt({ min: 0 }).withMessage('Each item must have a valid displayOrder'),
];
