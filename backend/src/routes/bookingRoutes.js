import { Router } from "express";

import {
  addBooking,
  getMyBookings,
} from "../controllers/bookingController.js";
import { authenticate } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import {
  createBookingSchema,
  myBookingsQuerySchema,
} from "../validators/bookingSchemas.js";

const router = Router();

router.post("/", authenticate, validate(createBookingSchema), addBooking);
router.get(
  "/mine",
  authenticate,
  validateQuery(myBookingsQuerySchema),
  getMyBookings,
);

export default router;
