export const validateRequest = (validator = {}) => (req, res, next) => {
  try {
    if (validator.params) {
      req.params = validator.params(req.params);
    }

    if (validator.query) {
      req.query = validator.query(req.query);
    }

    if (validator.body) {
      req.body = validator.body(req.body);
    }

    next();
  } catch (error) {
    next(error);
  }
};
