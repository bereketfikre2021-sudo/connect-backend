import { body } from 'express-validator';

export const createTrustedBrandValidators = [
  body('name').trim().notEmpty().withMessage('Brand name required'),
  body('website').optional({ nullable: true, checkFalsy: true }).trim().isURL().withMessage('Website must be a valid URL'),
  body('altText').optional().trim(),
  body('published').optional().isBoolean({ strict: false }).toBoolean(),
  body('displayOrder')
    .optional({ checkFalsy: true })
    .toInt()
    .custom((v) => { if (!isNaN(v) && v < 0) throw new Error('Display order must be 0 or greater'); return true; }),
];

export const updateTrustedBrandValidators = [...createTrustedBrandValidators];
