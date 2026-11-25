import { Router } from "express";

import {
  addResource,
  editResource,
  getAvailability,
  getResource,
  getResources,
} from "../controllers/resourceController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import {
  availabilityQuerySchema,
  createResourceSchema,
  resourceListQuerySchema,
  updateResourceSchema,
} from "../validators/resourceSchemas.js";

const router = Router();

router.get("/", authenticate, validateQuery(resourceListQuerySchema), getResources);
router.get(
  "/:id/availability",
  authenticate,
  validateObjectId("Resource"),
  validateQuery(availabilityQuerySchema),
  getAvailability,
);
router.get("/:id", authenticate, validateObjectId("Resource"), getResource);
router.post("/", authenticate, requireAdmin, validate(createResourceSchema), addResource);
router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  validateObjectId("Resource"),
  validate(updateResourceSchema),
  editResource,
);

export default router;
