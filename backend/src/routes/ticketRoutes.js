import { Router } from "express";

import {
  getTicketById,
  getTickets,
  importTicketFeed,
  updateTicket,
} from "../controllers/ticketController.js";
import { authenticate } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import {
  ticketImportSchema,
  ticketListQuerySchema,
  ticketUpdateSchema,
} from "../validators/ticketSchemas.js";

const router = Router();

router.post("/import", authenticate, validate(ticketImportSchema), importTicketFeed);
router.get("/", authenticate, validateQuery(ticketListQuerySchema), getTickets);
router.get("/:id", authenticate, getTicketById);
router.patch("/:id", authenticate, validate(ticketUpdateSchema), updateTicket);

export default router;
