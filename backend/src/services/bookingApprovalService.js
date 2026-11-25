import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import { HttpError } from "../utils/HttpError.js";

export const approveBooking = async (bookingId) => {
  const session = await mongoose.startSession();
  let approvedBooking;

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
          "Only future bookings can be approved",
        );
      }

      if (booking.status !== "PENDING") {
        throw new HttpError(
          409,
          "CONFLICT",
          "Only pending bookings can be approved",
        );
      }

      booking.status = "APPROVED";
      await booking.save({ session });
      approvedBooking = booking;
    });
  } finally {
    await session.endSession();
  }

  return approvedBooking;
};
