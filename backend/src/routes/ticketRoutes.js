import { Router } from "express";

import {
  getTicketById,
  getTickets,
  importTicketFeed,
} from "../controllers/ticketController.js";
import { authenticate } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import {
  ticketImportSchema,
  ticketListQuerySchema,
} from "../validators/ticketSchemas.js";

const router = Router();

router.post("/import", authenticate, validate(ticketImportSchema), importTicketFeed);
router.get("/", authenticate, validateQuery(ticketListQuerySchema), getTickets);
router.get("/:id", authenticate, getTicketById);

export default router;
