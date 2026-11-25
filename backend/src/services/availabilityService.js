import Booking from "../models/Booking.js";
import { getResourceById } from "./resourceService.js";

export const getResourceAvailability = async ({
  resourceId,
  role,
  from,
  to,
}) => {
  const resource = await getResourceById({ resourceId, role });

  if (!resource) {
    return null;
  }

  const bookings = await Booking.find({
    resourceId,
    status: { $in: ["PENDING", "APPROVED"] },
    startTime: { $lt: to },
    endTime: { $gt: from },
  })
    .select({ startTime: 1, endTime: 1, status: 1, _id: 0 })
    .sort({ startTime: 1, endTime: 1 })
    .lean();

  return {
    resourceId: resource.id,
    from: from.toISOString(),
    to: to.toISOString(),
    bookings,
  };
};
