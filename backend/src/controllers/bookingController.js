import { createBooking } from "../services/bookingCreationService.js";
import { listMyBookings } from "../services/bookingQueryService.js";

export const addBooking = async (req, res, next) => {
  try {
    const booking = await createBooking({
      userId: req.user.id,
      input: req.body,
    });

    return res.status(201).json(booking);
  } catch (error) {
    return next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const result = await listMyBookings({
      userId: req.user.id,
      ...req.validatedQuery,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
