import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import BookingSlot from "../models/BookingSlot.js";
import { HttpError } from "../utils/HttpError.js";

const CANCELLABLE_STATUSES = ["PENDING", "APPROVED"];

export const cancelBooking = async ({ bookingId, userId }) => {
  const session = await mongoose.startSession();
  let cancelledBooking;

  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        throw new HttpError(404, "NOT_FOUND", "Booking not found");
      }

      if (booking.userId.toString() !== userId) {
        throw new HttpError(403, "FORBIDDEN", "You cannot cancel this booking");
      }

      if (booking.startTime <= new Date()) {
        throw new HttpError(
          409,
          "CONFLICT",
          "Only future bookings can be cancelled",
        );
      }

      if (!CANCELLABLE_STATUSES.includes(booking.status)) {
        throw new HttpError(
          409,
          "CONFLICT",
          "Only pending or approved bookings can be cancelled",
        );
      }

      booking.status = "CANCELLED";
      await booking.save({ session });
      await BookingSlot.deleteMany({ bookingId: booking._id }).session(session);

      cancelledBooking = booking;
    });
  } finally {
    await session.endSession();
  }

  return cancelledBooking;
};
