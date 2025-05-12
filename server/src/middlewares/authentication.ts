import {
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from "@/utils/error";
import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { config } from "@/config/auth";
import { getUserById } from "@/models/user";

// * middleware for routes that require authentication
export const authenticate = async (c: Context, next: Next) => {
  try {
    console.log('=== Authentication Middleware Start ===');
    console.log('Request method:', c.req.method);
    console.log('Request path:', c.req.path);
    console.log('Content-Type:', c.req.header('Content-Type'));
    
    // Get and log the Authorization header
    const authHeader = c.req.header("Authorization");
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error('Authentication failed: Missing or invalid Authorization header format');
      throw new UnauthorizedError("Authentication required");
    }

    const token = authHeader.split(" ")[1] as string;
    console.log('Token extracted from header, length:', token.length);
    // Print first 10 chars of token for debugging (avoid printing full token for security)
    console.log('Token preview:', token.substring(0, 10) + '...');

    try {
      console.log('Attempting to verify token...');
      // * verify token
      const verifyToken = await verify(token, config.jwtSecret) as any;
      console.log('Token verification result:', !!verifyToken);

      if (!verifyToken || !verifyToken.user_id) {
        console.error('Token verification failed: Invalid token payload');
        throw new UnauthorizedError("Invalid token");
      }

      console.log('Token contains user_id:', verifyToken.user_id);
      
      // * check if user exists
      console.log('Looking up user with ID:', verifyToken.user_id);
      const user = await getUserById(verifyToken.user_id);
      if (!user) {
        console.error('User not found with ID:', verifyToken.user_id);
        throw new NotFoundError("User not found");
      }

      console.log('User found:', user.username, 'Role:', user.role);
      
      // Set context variables
      c.set("jwtPayload", verifyToken);
      c.set("user_id", verifyToken.user_id);
      c.set("user_role", user.role); // Set user role for further authorization checks
      console.log('Authentication successful, proceeding to next middleware');
      console.log('=== Authentication Middleware End ===');

      await next();
    } catch (verifyError) {
      console.error("Token verification error detailed:", verifyError);
      if (verifyError instanceof Error) {
        console.error('Error name:', verifyError.name);
        console.error('Error message:', verifyError.message);
        console.error('Error stack:', verifyError.stack);
      }
      throw new UnauthorizedError("Invalid token");
    }
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw error;
    }
    console.error(`Error authenticating user: ${error}`);
    throw error;
  }
};

// * middleware for routes that require admin privileges
export const requireAdmin = async (c: Context, next: Next) => {
  try {
    const user_id = c.get("user_id");
    if (!user_id) {
      throw new UnauthorizedError("Authentication required");
    }

    const user = await getUserById(user_id);
    if (!user || user.role !== "admin") {
      throw new ForbiddenError("Admin access required");
    }

    await next();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      throw error;
    }
    console.error(`Error authenticating user: ${error}`);
    throw error;
  }
};

// * Special middleware for refresh token endpoint
export const authenticateForRefreshToken = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication required");
    }

    const token = authHeader.split(" ")[1] as string;

    //* Verify the token
    const verifyToken = await verify(token, config.jwtSecret) as any;
    if (verifyToken && verifyToken.user_id) {
      c.set("jwtPayload", verifyToken);
      c.set("user_id", verifyToken.user_id);
    }

    //* Set the token for refresh endpoint
    c.set("expiredToken", token);

    await next();
  } catch (error) {
    console.error(`Error in refresh token middleware: ${error}`);
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw error;
  }
};