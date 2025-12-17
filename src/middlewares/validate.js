export const validate = (schema) => {
  return (req, res, next) => {
    if (!schema) {
      return next();
    }

    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      const errors = error.errors?.map(err => ({
        field: err.path.join('.'),
        message: err.message
      })) || [];

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
  };
};
