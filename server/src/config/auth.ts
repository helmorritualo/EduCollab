import { jwt } from "hono/jwt";

// * JWT (JSON Web Token) configuration
export const config = {
  // * Secret key used to sign JWT tokens
  jwtSecret: process.env.JWT_SECRET || "your-development-secret-key",

};
