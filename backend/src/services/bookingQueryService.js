import Booking from "../models/Booking.js";
import { HttpError } from "../utils/HttpError.js";

const PAGE_SIZE = 10;

export const listMyBookings = async ({ userId, status, page }) => {
  const filter = { userId };

  if (status) {
    filter.status = status;
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ startTime: -1, _id: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE),
    Booking.countDocuments(filter),
  ]);

  return {
    data: bookings,
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
};

export const getBooking = async ({ bookingId, user }) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new HttpError(404, "NOT_FOUND", "Booking not found");
  }

  const isOwner = booking.userId.toString() === user.id;

  if (!isOwner && user.role !== "ADMIN") {
    throw new HttpError(403, "FORBIDDEN", "You cannot access this booking");
  }

  return booking;
};
