import { Router } from "express";

import {
  addBooking,
  getAllBookings,
  getBookingById,
  getMyBookings,
} from "../controllers/bookingController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import {
  adminBookingsQuerySchema,
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
router.get(
  "/",
  authenticate,
  requireAdmin,
  validateQuery(adminBookingsQuerySchema),
  getAllBookings,
);
router.get(
  "/:id",
  authenticate,
  validateObjectId("Booking"),
  getBookingById,
);

export default router;
