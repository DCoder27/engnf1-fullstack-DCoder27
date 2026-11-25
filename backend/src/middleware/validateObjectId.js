import mongoose from "mongoose";

export const validateObjectId = (entityName) => {
  return (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: `${entityName} not found`,
        },
      });
    }

    return next();
  };
};
