import { Router } from 'express';
import * as propertyController from '../controllers/property.controller';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  createPropertySchema,
  updatePropertySchema,
  propertyIdParamSchema,
  queryPropertySchema,
} from '../schemas/property.schema';

const router = Router();

// Public property read endpoints
router.get('/', validate(queryPropertySchema), propertyController.getProperties);
router.get('/:id', validate(propertyIdParamSchema), propertyController.getPropertyById);

// Protected mutation endpoints
router.post(
  '/',
  authMiddleware,
  validate(createPropertySchema),
  propertyController.createProperty
);

router.put(
  '/:id',
  authMiddleware,
  validate(updatePropertySchema),
  propertyController.updateProperty
);

router.delete(
  '/:id',
  authMiddleware,
  validate(propertyIdParamSchema),
  propertyController.deleteProperty
);

export default router;
