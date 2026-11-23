import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function validateEndTime(value) {
          return !this.startTime || value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
      required: true,
    },
    decisionNote: {
      type: String,
      trim: true,
      minlength: 5,
      maxlength: 200,
      default: null,
      required: function requireDecisionNote() {
        return this.status === "REJECTED";
      },
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
    versionKey: false,
    toJSON: {
      transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
      },
    },
  },
);

bookingSchema.index({
  resourceId: 1,
  status: 1,
  startTime: 1,
  endTime: 1,
});

bookingSchema.index({
  userId: 1,
  status: 1,
  startTime: 1,
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
