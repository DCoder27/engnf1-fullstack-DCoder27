import Booking from "../models/Booking.js";
import Resource from "../models/Resource.js";
import { getTicketStats } from "./ticketStatsService.js";

const BOOKING_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

const buildBookingStatusCounts = (rows) => {
  const counts = Object.fromEntries(
    BOOKING_STATUSES.map((status) => [status, 0]),
  );

  for (const row of rows) {
    counts[row._id] = row.count;
  }

  return counts;
};

export const getAdminStats = async () => {
  const [activeResources, bookingStatusRows, topResourceRows, ticketStats] =
    await Promise.all([
      Resource.countDocuments({ isActive: true }),
      Booking.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $group: { _id: "$resourceId", bookingCount: { $sum: 1 } } },
        { $sort: { bookingCount: -1, _id: 1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: "resources",
            localField: "_id",
            foreignField: "_id",
            as: "resource",
          },
        },
        { $unwind: "$resource" },
        {
          $project: {
            _id: 0,
            resourceId: "$_id",
            name: "$resource.name",
            bookingCount: 1,
          },
        },
      ]),
      getTicketStats(),
    ]);

  const topResources = topResourceRows.map((resource) => ({
    ...resource,
    resourceId: resource.resourceId.toString(),
  }));

  return {
    activeResources,
    bookingsByStatus: buildBookingStatusCounts(bookingStatusRows),
    topResources,
    ticketStats,
  };
};
