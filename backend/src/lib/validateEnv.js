const REQUIRED_ALWAYS = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const REQUIRED_IN_PRODUCTION = ["FRONTEND_URL"];

export const validateEnv = () => {
  const missing = REQUIRED_ALWAYS.filter((key) => !process.env[key]);

  if (process.env.NODE_ENV === "production") {
    missing.push(
      ...REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]),
    );
  }

  if (missing.length > 0) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Missing required environment variables",
        missing,
        timestamp: new Date().toISOString(),
      }),
    );
    process.exit(1);
  }
};
