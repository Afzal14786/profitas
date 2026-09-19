export function validate(schema, source = "body") {
  return (req, res, next) => {
    if (source === "body" && req.body === undefined) {
      return res.status(415).json({
        success: false,
        statusCode: 415,
        code: "UNSUPPORTED_MEDIA_TYPE",
        message:
          "Request body was not parsed. Send Content-Type: application/json with a JSON body.",
      });
    }

    const target = source === "query" ? req.query : source === "params" ? req.params : req.body;
    const result = schema.safeParse(target);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: result.error.flatten(),
      });
    }

    if (source === "query") req.query = result.data;
    else if (source === "params") req.params = result.data;
    else req.body = result.data;

    next();
  };
}