export const validate = (schema, errorStatus = 422) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(errorStatus).json({
        error: {
          code: "VALIDATION_ERROR",
          message: result.error.issues[0].message,
        },
      });
    }

    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: result.error.issues[0].message,
        },
      });
    }

    req.validatedQuery = result.data;
    next();
  };
};
