import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSlotStarts,
  validateBookingWindow,
} from "./bookingRules.js";

const now = new Date("2026-11-25T10:00:00.000Z");

test("accepts a valid future booking window", () => {
  assert.doesNotThrow(() => {
    validateBookingWindow(
      new Date("2026-11-26T10:00:00.000Z"),
      new Date("2026-11-26T11:00:00.000Z"),
      now,
    );
  });
});

test("rejects off-grid, past, and overlong booking windows", () => {
  assert.throws(() => {
    validateBookingWindow(
      new Date("2026-11-26T10:15:00.000Z"),
      new Date("2026-11-26T11:00:00.000Z"),
      now,
    );
  });

  assert.throws(() => {
    validateBookingWindow(
      new Date("2026-11-25T09:00:00.000Z"),
      new Date("2026-11-25T10:00:00.000Z"),
      now,
    );
  });

  assert.throws(() => {
    validateBookingWindow(
      new Date("2026-11-26T10:00:00.000Z"),
      new Date("2026-11-26T14:30:00.000Z"),
      now,
    );
  });
});

test("creates one lock timestamp for each occupied half-hour", () => {
  const slots = buildSlotStarts(
    new Date("2026-11-26T10:00:00.000Z"),
    new Date("2026-11-26T11:30:00.000Z"),
  );

  assert.deepEqual(
    slots.map((slot) => slot.toISOString()),
    [
      "2026-11-26T10:00:00.000Z",
      "2026-11-26T10:30:00.000Z",
      "2026-11-26T11:00:00.000Z",
    ],
  );
});
