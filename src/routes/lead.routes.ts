import { Router } from 'express';
import * as leadController from '../controllers/lead.controller';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  createLeadSchema,
  getLeadsQuerySchema,
  assignLeadPropertySchema,
  updateLeadStatusSchema,
  leadIdParamSchema,
} from '../schemas/lead.schema';

const router = Router();

// Create a new lead (e.g. from public inquiry forms or CRM input)
router.post('/', validate(createLeadSchema), leadController.createLead);

// Protected endpoints for lead management
router.get('/', authMiddleware, validate(getLeadsQuerySchema), leadController.getLeads);

router.get('/:id', authMiddleware, validate(leadIdParamSchema), leadController.getLeadById);

router.patch(
  '/:id/assign',
  authMiddleware,
  validate(assignLeadPropertySchema),
  leadController.assignProperty
);

router.patch(
  '/:id/status',
  authMiddleware,
  validate(updateLeadStatusSchema),
  leadController.updateLeadStatus
);

export default router;
