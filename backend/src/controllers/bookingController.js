import { createBooking } from "../services/bookingCreationService.js";

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
