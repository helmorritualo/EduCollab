import { register, login, refreshToken } from "@/services/auth.service";
import { Context } from "hono";
import { BadRequestError } from "@/utils/error";

export const registerHandler = async (c: Context) => {
  const userData = await c.req.json();

  const user = await register(userData);

  return c.json({
    success: true,
    message: "Registered successfully",
    user,
  }, 201);
};

export const loginHandler = async (c: Context) => {
  const userData = await c.req.json();

  const result = await login(userData);
  const { userWithoutPassword, token} = result;

  return c.json({
    success: true,
    message: "Logged in successfully",
    user: userWithoutPassword,
    token: token,
  }, 200);
};

export const refreshTokenHandler = async (c: Context) => {
  try {
    //* Get the JWT payload first (for valid tokens)
    const jwtPayload = c.get("jwtPayload");

    //* If no valid payload, check for expired token access
    if (!jwtPayload) {
      const expiredToken = c.get("expiredToken");
      if (!expiredToken) {
        throw new BadRequestError("No token provided");
      }

      //* Pass the expired token to the service for potential refresh of token access
      const result = await refreshToken({ token: expiredToken });

      return c.json({
        success: true,
        message: "Token refreshed successfully",
        token: result.token,
      }, 200);
    }

    //* For valid tokens, proceed as normal for token refresh
    const result = await refreshToken(jwtPayload);

    return c.json({
      success: true,
      message: "Token refreshed successfully",
      token: result.token,
    }, 200);
  } catch (error) {
    console.error("Error refreshing token:", error);
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw error;
  }
};
