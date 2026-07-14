import { body } from 'express-validator';
import { PORTFOLIO_CATEGORIES } from '../constants';

export const createPortfolioValidators = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('category')
    .notEmpty()
    .isIn(PORTFOLIO_CATEGORIES)
    .withMessage(`Category must be one of: ${PORTFOLIO_CATEGORIES.join(', ')}`),
  body('slug').optional().trim().toLowerCase(),
  body('client').optional().trim().escape(),
  body('industry').optional().trim().escape(),
  body('year')
    .optional({ checkFalsy: true })
    .toInt()
    .custom((v) => {
      if (isNaN(v)) return true;
      if (v < 2000 || v > 2100) throw new Error('Year must be between 2000 and 2100');
      return true;
    }),
  body('shortDescription').optional().trim(),
  body('fullDescription').optional().trim(),
  // arrays arrive as JSON strings from FormData — parsed in the controller
  body('servicesProvided').optional(),
  body('technologies').optional(),
  body('projectUrl')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Project URL must be valid'),
  body('altText').optional().trim().escape(),
  body('caseStudyChallenge').optional().trim(),
  body('caseStudySolution').optional().trim(),
  body('caseStudyResults').optional(),
  body('featured').optional().isBoolean({ strict: false }).toBoolean(),
  body('published').optional().isBoolean({ strict: false }).toBoolean(),
  body('status').optional().isIn(['published', 'draft', 'archived']).withMessage('Status must be published, draft, or archived'),
  body('displayOrder')
    .optional({ checkFalsy: true })
    .toInt()
    .custom((v) => { if (!isNaN(v) && v < 0) throw new Error('Display order must be 0 or greater'); return true; }),
  body('seoTitle').optional().trim(),
  body('seoDescription').optional().trim(),
];

export const updatePortfolioValidators = [...createPortfolioValidators];
