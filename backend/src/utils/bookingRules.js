import { HttpError } from "./HttpError.js";

const SLOT_DURATION_MS = 30 * 60 * 1000;
const MAX_DURATION_MS = 240 * 60 * 1000;
const MAX_ADVANCE_MS = 30 * 24 * 60 * 60 * 1000;

const validationError = (message) => {
  return new HttpError(400, "VALIDATION_ERROR", message);
};

const isOnThirtyMinuteGrid = (date) => {
  return (
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0 &&
    [0, 30].includes(date.getUTCMinutes())
  );
};

export const validateBookingWindow = (startTime, endTime, now = new Date()) => {
  if (!isOnThirtyMinuteGrid(startTime) || !isOnThirtyMinuteGrid(endTime)) {
    throw validationError("Start and end times must fall on a 00 or 30 minute UTC grid");
  }

  const duration = endTime.getTime() - startTime.getTime();

  if (
    duration < SLOT_DURATION_MS ||
    duration > MAX_DURATION_MS ||
    duration % SLOT_DURATION_MS !== 0
  ) {
    throw validationError("Booking duration must be 30 to 240 minutes in 30-minute steps");
  }

  if (startTime <= now) {
    throw validationError("Booking start time must be in the future");
  }

  if (startTime.getTime() - now.getTime() > MAX_ADVANCE_MS) {
    throw validationError("Booking start time must be no more than 30 days ahead");
  }
};

export const buildSlotStarts = (startTime, endTime) => {
  const slots = [];

  for (
    let timestamp = startTime.getTime();
    timestamp < endTime.getTime();
    timestamp += SLOT_DURATION_MS
  ) {
    slots.push(new Date(timestamp));
  }

  return slots;
};
