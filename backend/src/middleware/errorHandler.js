export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error?.status && error?.code) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  if (error?.name === "ValidationError") {
    const firstMessage = Object.values(error.errors)[0]?.message;

    return res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: firstMessage || "The request is invalid",
      },
    });
  }

  console.error(error);

  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
};
