import mongoose from "mongoose";

let connectionPromise;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI).then((mongooseInstance) => {
      console.log("MongoDB connected successfully...");
      return mongooseInstance.connection;
    });

    connectionPromise.catch(() => {
      connectionPromise = undefined;
    });
  }

  return connectionPromise;
};
