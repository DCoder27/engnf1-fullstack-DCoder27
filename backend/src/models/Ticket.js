import mongoose from "mongoose";

const categories = ["BILLING", "BUG", "FEATURE_REQUEST", "LOGIN", "DELIVERY"];

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const ticketSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 2000,
    },
    autoCategory: {
      type: String,
      enum: categories,
      required: true,
    },
    category: {
      type: String,
      enum: categories,
      required: true,
    },
    isHumanOverride: {
      type: Boolean,
      default: false,
      required: true,
    },
    priority: {
      type: String,
      enum: priorities,
      required: true,
    },
    status: {
      type: String,
      enum: statuses,
      default: "OPEN",
      required: true,
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isReviewed: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
      },
    },
  },
);

ticketSchema.index({ externalId: 1 }, { unique: true });
ticketSchema.index({
  status: 1,
  category: 1,
  priority: 1,
  createdAt: -1,
});

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
