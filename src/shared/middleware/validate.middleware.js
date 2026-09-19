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

    const target =
      source === "query"
        ? req.query
        : source === "params"
        ? req.params
        : req.body;

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

    // Express 5 makes req.query (and sometimes req.params) getter-only on the
    // prototype. Shadow them on the instance so downstream controllers see
    // the validated + coerced values.
    if (source === "query") {
      Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else if (source === "params") {
      Object.defineProperty(req, "params", {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      req.body = result.data;
    }

    next();
  };
}