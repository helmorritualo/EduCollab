import { Context, Next } from "hono";
import { BadRequestError } from "@/utils/error";

export const validateRegister = async (c: Context, next: Next) => {
  try {
    const body = await c.req.json();
    const { username, password, email, full_name, phone_number, gender, role } = body;
    
    if (!username || !password || !email || !full_name || !phone_number || !gender || !role) {
      throw new BadRequestError("All fields are required");
    }
    
    // * Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError("Invalid email format");
    }
    
    // * Password length validation
    if (password.length < 8) {
      throw new BadRequestError("Password must be at least 8 characters");
    }
    
    // * Store the validated body for the next middleware/handler
    c.set('validatedBody', body);
    
    await next();
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error; 
    }
    throw new BadRequestError("Invalid request body");
  }
};

export const validateLogin = async (c: Context, next: Next) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;
    
    if (!username || !password) {
      throw new BadRequestError("Username and password are required");
    }
    
    c.set('validatedBody', body);
    
    await next();
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error; 
    }
    throw new BadRequestError("Invalid request body");
  }
};