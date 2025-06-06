import { UnauthorizedError, NotFoundError, ForbiddenError, } from "@/utils/error";
import { verify } from "hono/jwt";
import { config } from "@/config/auth";
import { getUserById } from "@/models/user";
// * middleware for routes that require authentication
export const authenticate = async (c, next) => {
    try {
        // Get and log the Authorization header
        const authHeader = c.req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("Authentication required");
        }
        const token = authHeader.split(" ")[1];
        try {
            // * verify token
            const verifyToken = await verify(token, config.jwtSecret);
            if (!verifyToken || !verifyToken.user_id) {
                throw new UnauthorizedError("Invalid token");
            }
            const user = await getUserById(verifyToken.user_id);
            if (!user) {
                throw new NotFoundError("User not found");
            }
            // Set context variables
            c.set("jwtPayload", verifyToken);
            c.set("user_id", verifyToken.user_id);
            c.set("user_role", user.role); // Set user role for further authorization checks
            await next();
        }
        catch (verifyError) {
            throw new UnauthorizedError("Invalid token");
        }
    }
    catch (error) {
        if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
            throw error;
        }
        console.error(`Error authenticating user: ${error}`);
        throw error;
    }
};
// * middleware for routes that require admin privileges
export const requireAdmin = async (c, next) => {
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
    }
    catch (error) {
        if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
            throw error;
        }
        console.error(`Error authenticating user: ${error}`);
        throw error;
    }
};
// * Special middleware for refresh token endpoint
export const authenticateForRefreshToken = async (c, next) => {
    try {
        const authHeader = c.req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("Authentication required");
        }
        const token = authHeader.split(" ")[1];
        //* Verify the token
        const verifyToken = await verify(token, config.jwtSecret);
        if (verifyToken && verifyToken.user_id) {
            c.set("jwtPayload", verifyToken);
            c.set("user_id", verifyToken.user_id);
        }
        //* Set the token for refresh endpoint
        c.set("expiredToken", token);
        await next();
    }
    catch (error) {
        console.error(`Error in refresh token middleware: ${error}`);
        if (error instanceof UnauthorizedError) {
            throw error;
        }
        throw error;
    }
};
