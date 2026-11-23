import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 60,
    },
    type: {
      type: String,
      enum: ["ROOM", "LAB", "EQUIPMENT"],
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 500,
      validate: {
        validator: Number.isInteger,
        message: "Capacity must be an integer",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
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

resourceSchema.index(
  { name: 1 },
  {
    unique: true,
    collation: {
      locale: "en",
      strength: 2,
    },
  },
);

resourceSchema.index({ isActive: 1, type: 1, name: 1 });

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
