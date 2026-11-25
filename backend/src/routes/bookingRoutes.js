import { Router } from "express";

import {
  addBooking,
  approvePendingBooking,
  cancelMyBooking,
  getAllBookings,
  getBookingById,
  getMyBookings,
  rejectPendingBooking,
} from "../controllers/bookingController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import {
  adminBookingsQuerySchema,
  createBookingSchema,
  myBookingsQuerySchema,
  rejectBookingSchema,
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
router.patch(
  "/:id/approve",
  authenticate,
  requireAdmin,
  validateObjectId("Booking"),
  approvePendingBooking,
);
router.patch(
  "/:id/cancel",
  authenticate,
  validateObjectId("Booking"),
  cancelMyBooking,
);
router.patch(
  "/:id/reject",
  authenticate,
  requireAdmin,
  validateObjectId("Booking"),
  validate(rejectBookingSchema, 400),
  rejectPendingBooking,
);
router.get(
  "/:id",
  authenticate,
  validateObjectId("Booking"),
  getBookingById,
);

export default router;
