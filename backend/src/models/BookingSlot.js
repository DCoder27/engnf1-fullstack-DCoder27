import mongoose from "mongoose";

const bookingSlotSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    slotStart: {
      type: Date,
      required: true,
    },
  },
  {
    collection: "booking_slots",
    versionKey: false,
  },
);

bookingSlotSchema.index(
  { resourceId: 1, slotStart: 1 },
  { unique: true },
);
bookingSlotSchema.index({ bookingId: 1 });

const BookingSlot = mongoose.model("BookingSlot", bookingSlotSchema);

export default BookingSlot;
