import { sign } from "hono/jwt";
import { getUserByEmail, getUserByUsername, createUser, getUserById } from "@/models/user";
import {
  InternalServerError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "@/utils/error";
import { config } from "@/config/auth";
import { User } from "@/types";
import { compare, hash } from 'bcrypt';

let payload: {
  user_id: number;
  email: string;
  role: string;
  exp: number;
};

export const register = async (userData: User) => {
  try {
    const { username, password, email, full_name, phone_number, gender, role } = userData;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new BadRequestError("User already exists");
    }
    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);

    const user = {
      username,
      password: hashedPassword,
      email,
      full_name,
      phone_number,
      gender,
      role,
    } as User;

    await createUser(user);

    //* remove password from response
    return {
      username,
      email,
      full_name,
      phone_number,
      gender,
      role
    };
  } catch (error) {
    console.error(`Error registering user: ${error}`);
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new InternalServerError("Internal Server Error");
  }
};

export const login = async (credentials: {
  username: string;
  password: string;
}) => {
  try {
    const { username, password } = credentials;

    const user = await getUserByUsername(username);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const storedUserPassword = user.password;
    const isPasswordValid = await compare(password, storedUserPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid password");
    }

    //* generate a JWT token
    payload = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // token expire in 1 hour
    };

    const token = await sign(payload, config.jwtSecret);

    //* remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      userWithoutPassword,
      token,
    };
  } catch (error) {
    console.error(`Error logging in user: ${error}`);
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new InternalServerError("Internal Server Error");
  }
};

export const refreshToken = async (data: any) => {
  try {
    let userId, email, role;
    
    //* Check if we're dealing with an expired token
    if (data.token) {
      try {
        //* Try to decode the token without verification
        const tokenParts = data.token.split('.');
        if (tokenParts.length !== 3) {
          throw new UnauthorizedError("Invalid token format");
        }
        
        //* Decode the payload parts
        const decodedPayload = JSON.parse(
          Buffer.from(tokenParts[1], 'base64').toString()
        );
        
        //* Extract user information in the payload
        userId = decodedPayload.user_id;
        email = decodedPayload.email;
        role = decodedPayload.role;
        
        const user = await getUserById(userId);
        if (!user) {
          throw new NotFoundError("User not found");
        }
      } catch (error) {
        console.error("Error decoding expired token:", error);
        throw new UnauthorizedError("Invalid token - cannot refresh");
      }
    } else {
      //* If we don't have an expired token, proceed with normal token refresh
      if (!data || !data.user_id) {
        throw new UnauthorizedError("Invalid token data");
      }
      
      userId = data.user_id;
      email = data.email;
      role = data.role;
    }

    //* Generate a new JWT token
    const payload = {
      user_id: userId,
      email: email,
      role: role,
      exp: Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60, // token expire in 15 days
    };

    const newToken = await sign(payload, config.jwtSecret);

    return {
      token: newToken,
    };
  } catch (error) {
    console.error(`Error refreshing token: ${error}`);
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw error; 
    }
    throw new InternalServerError("Internal Server Error");
  }
};