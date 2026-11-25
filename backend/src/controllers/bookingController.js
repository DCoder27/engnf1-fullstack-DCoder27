import { createBooking } from "../services/bookingCreationService.js";
import { cancelBooking } from "../services/bookingCancellationService.js";
import {
  getBooking,
  listAllBookings,
  listMyBookings,
} from "../services/bookingQueryService.js";

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

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await getBooking({
      bookingId: req.params.id,
      user: req.user,
    });

    return res.status(200).json(booking);
  } catch (error) {
    return next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const result = await listAllBookings(req.validatedQuery);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export const cancelMyBooking = async (req, res, next) => {
  try {
    const booking = await cancelBooking({
      bookingId: req.params.id,
      userId: req.user.id,
    });

    return res.status(200).json(booking);
  } catch (error) {
    return next(error);
  }
};
