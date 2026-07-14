import { body } from 'express-validator';

export const createLeadValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().notEmpty().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('service').optional().trim(),
  body('budget').optional().trim(),
  body('message').trim().notEmpty().withMessage('Message is required'),
];

export const updateStatusValidators = [
  body('status')
    .notEmpty()
    .isIn(['new', 'contacted', 'negotiating', 'won', 'lost'])
    .withMessage('Status must be one of: new, contacted, negotiating, won, lost'),
  body('notes').optional().trim(),
];
