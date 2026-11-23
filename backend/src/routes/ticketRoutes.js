import { Router } from "express";

import { importTicketFeed } from "../controllers/ticketController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { ticketImportSchema } from "../validators/ticketSchemas.js";

const router = Router();

router.post("/import", authenticate, validate(ticketImportSchema), importTicketFeed);

export default router;
