import Booking from "../models/Booking.js";

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
