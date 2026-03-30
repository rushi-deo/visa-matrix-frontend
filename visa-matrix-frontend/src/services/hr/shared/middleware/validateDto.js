export const validateDto = (schema, source = "body") => (req, res, next) => {
  try {
    req.validated = req.validated ?? {};
    req.validated[source] = schema.parse(req[source] ?? {});
    next();
  } catch (error) {
    next(error);
  }
};

