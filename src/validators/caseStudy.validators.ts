import { body } from 'express-validator';

export const createCaseStudyValidators = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('client').trim().notEmpty().withMessage('Client required'),
  body('slug').optional().trim().toLowerCase(),
  body('industry').optional().trim(),
  body('overview').optional().trim(),
  body('challenge').optional(),   // JSON string array — parsed in controller
  body('research').optional().trim(),
  body('strategy').optional().trim(),
  body('designProcess').optional().trim(),
  body('solution').optional().trim(),
  body('role').optional(),        // JSON string array — parsed in controller
  body('results').optional().trim(),
  body('conclusion').optional().trim(),
  body('published').optional().isBoolean({ strict: false }).toBoolean(),
  body('displayOrder')
    .optional({ checkFalsy: true })
    .toInt()
    .custom((v) => { if (!isNaN(v) && v < 0) throw new Error('Display order must be 0 or greater'); return true; }),
  body('seoTitle').optional().trim(),
  body('seoDescription').optional().trim(),
];

export const updateCaseStudyValidators = [...createCaseStudyValidators];
