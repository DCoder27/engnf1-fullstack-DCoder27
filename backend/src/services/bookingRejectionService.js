import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import BookingSlot from "../models/BookingSlot.js";
import { HttpError } from "../utils/HttpError.js";

export const rejectBooking = async ({ bookingId, note }) => {
  const session = await mongoose.startSession();
  let rejectedBooking;

  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        throw new HttpError(404, "NOT_FOUND", "Booking not found");
      }

      if (booking.startTime <= new Date()) {
        throw new HttpError(
          409,
          "CONFLICT",
          "Only future bookings can be rejected",
        );
      }

      if (booking.status !== "PENDING") {
        throw new HttpError(
          409,
          "CONFLICT",
          "Only pending bookings can be rejected",
        );
      }

      booking.status = "REJECTED";
      booking.decisionNote = note;
      await booking.save({ session });
      await BookingSlot.deleteMany({ bookingId: booking._id }).session(session);

      rejectedBooking = booking;
    });
  } finally {
    await session.endSession();
  }

  return rejectedBooking;
};
