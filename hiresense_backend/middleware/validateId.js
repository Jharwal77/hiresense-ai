export function validatePositiveInteger(
  paramName = "id",
  label = "ID"
) {
  return (req, res, next) => {
    const value =
      Number(req.params[paramName]);

    if (
      !Number.isInteger(value) ||
      value <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          `${label} must be a positive integer`,
        errorCode:
          "INVALID_ID"
      });
    }

    req.params[paramName] =
      String(value);

    next();
  };
}