export function validate(schema) {
  return (req, res, next) => {
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("req.body:", req.body);
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: result.error.flatten(),
      });
    }
    req.body = result.data;
    next();
  };
}