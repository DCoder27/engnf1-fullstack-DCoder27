import { Router } from "express";

import { addBooking } from "../controllers/bookingController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createBookingSchema } from "../validators/bookingSchemas.js";

const router = Router();

router.post("/", authenticate, validate(createBookingSchema), addBooking);

export default router;
