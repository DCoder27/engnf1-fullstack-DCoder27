import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import BookingSlot from "../models/BookingSlot.js";
import Resource from "../models/Resource.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { buildSlotStarts, validateBookingWindow } from "../utils/bookingRules.js";
import { HttpError } from "../utils/HttpError.js";

const BLOCKING_STATUSES = ["PENDING", "APPROVED"];

const conflict = (message) => {
  return new HttpError(409, "CONFLICT", message);
};

const isDuplicateKeyError = (error) => {
  return error?.code === 11000 || error?.errorResponse?.code === 11000;
};

export const createBooking = async ({ userId, input }) => {
  const now = new Date();
  validateBookingWindow(input.startTime, input.endTime, now);

  // Build the unique slot index before accepting concurrent requests.
  await BookingSlot.init();

  const session = await mongoose.startSession();
  let bookingId;

  try {
    await session.withTransaction(async () => {
      // Updating the user serializes concurrent booking-limit checks.
      await User.updateOne(
        { _id: userId },
        { $inc: { bookingVersion: 1 } },
        { session },
      );

      const [resource, activeFutureBookings] = await Promise.all([
        Resource.findOne({ _id: input.resourceId, isActive: true }).session(session),
        Booking.countDocuments({
          userId,
          status: { $in: BLOCKING_STATUSES },
          startTime: { $gt: now },
        }).session(session),
      ]);

      if (!resource) {
        throw new HttpError(404, "NOT_FOUND", "Resource not found");
      }

      if (input.ticketId) {
        const ticketExists = await Ticket.exists({ _id: input.ticketId }).session(
          session,
        );

        if (!ticketExists) {
          throw new HttpError(404, "NOT_FOUND", "Ticket not found");
        }
      }

      if (activeFutureBookings >= 3) {
        throw conflict("A user may have at most 3 future active bookings");
      }

      // This catches pre-existing bookings that were created before slot locks.
      const overlapExists = await Booking.exists({
        resourceId: input.resourceId,
        status: { $in: BLOCKING_STATUSES },
        startTime: { $lt: input.endTime },
        endTime: { $gt: input.startTime },
      }).session(session);

      if (overlapExists) {
        throw conflict("The requested resource slot is not available");
      }

      bookingId = new mongoose.Types.ObjectId();
      const slots = buildSlotStarts(input.startTime, input.endTime).map(
        (slotStart) => ({
          resourceId: input.resourceId,
          bookingId,
          slotStart,
        }),
      );

      await BookingSlot.insertMany(slots, { session });
      await Booking.create(
        [
          {
            _id: bookingId,
            resourceId: input.resourceId,
            userId,
            ticketId: input.ticketId ?? null,
            startTime: input.startTime,
            endTime: input.endTime,
            purpose: input.purpose,
            status: "PENDING",
          },
        ],
        { session },
      );
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw conflict("The requested resource slot is not available");
    }

    throw error;
  } finally {
    await session.endSession();
  }

  return Booking.findById(bookingId);
};
