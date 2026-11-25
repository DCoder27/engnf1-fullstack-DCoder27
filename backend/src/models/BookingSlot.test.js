import assert from "node:assert/strict";
import test from "node:test";

import BookingSlot from "./BookingSlot.js";

test("booking slots enforce one resource lock per half-hour", () => {
  const indexes = BookingSlot.schema.indexes();
  const slotIndex = indexes.find(([fields]) => {
    return fields.resourceId === 1 && fields.slotStart === 1;
  });

  assert.ok(slotIndex);
  assert.equal(slotIndex[1].unique, true);
});

test("booking slots are indexed for lifecycle cleanup", () => {
  const indexes = BookingSlot.schema.indexes();
  const bookingIndex = indexes.find(([fields]) => fields.bookingId === 1);

  assert.ok(bookingIndex);
});
