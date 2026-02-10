import { ZodError } from "zod";

/**
 * Validation middleware factory
 * @param {ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate request data (body, params, query)
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      // If validation passes, continue to next middleware
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          error: "Validation failed",
          details: formattedErrors,
        });
      }

      // Handle unexpected errors
      console.error("Validation middleware error:", error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  };
};
