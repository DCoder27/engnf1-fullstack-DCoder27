export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);

  if (error?.name === "ValidationError") {
    const firstMessage = Object.values(error.errors)[0]?.message;

    return res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: firstMessage || "The request is invalid",
      },
    });
  }

  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
};
