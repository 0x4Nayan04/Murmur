import jwt from "jsonwebtoken";

const getCookieOptions = (maxAge) => ({
  maxAge,
  httpOnly: true, // Prevent XSS attacks
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' for cross-origin (production), 'lax' for dev
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  path: "/", // Ensure cookie is sent with all requests
});

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, getCookieOptions(7 * 24 * 60 * 60 * 1000));

  return token;
};

export const clearAuthCookie = (res) => {
  res.cookie("jwt", "", getCookieOptions(0));
};
