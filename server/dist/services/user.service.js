import { updateUser, deactivateUser, activateUser, getUserById, updatePassword, getAllUsers, } from "@/models/user";
import { NotFoundError, InternalServerError, BadRequestError, } from "@/utils/error";
import { compare, hash } from "bcrypt";
export const getAllUsersService = async () => {
    try {
        const users = await getAllUsers();
        if (!users || users.length === 0) {
            throw new NotFoundError("Users not found");
        }
        const usersWithoutPassword = users.map((user) => {
            const { password: _, ...userWithoutPassword } = user || {};
            return userWithoutPassword;
        });
        return usersWithoutPassword;
    }
    catch (error) {
        console.error(`Error fetching users: ${error}`);
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new InternalServerError("Internal server error");
    }
};
export const getUserProfileService = async (user_id) => {
    try {
        const user = await getUserById(user_id);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        const { password: _, ...userWithoutPassword } = user || {};
        return userWithoutPassword;
    }
    catch (error) {
        console.error(`Error fetching user: ${error}`);
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new InternalServerError("Internal server error");
    }
};
export const updateUserService = async (user_id, userData) => {
    try {
        const existingUser = await getUserById(user_id);
        if (!existingUser) {
            throw new NotFoundError("User not found");
        }
        const updatedUser = await updateUser(user_id, userData);
        if (!updatedUser) {
            throw new BadRequestError("Failed to update user");
        }
        const user = await getUserById(user_id);
        const { password: _, ...userWithoutPassword } = user || {};
        return userWithoutPassword;
    }
    catch (error) {
        console.error(`Error updating user: ${error}`);
        if (error instanceof NotFoundError || error instanceof BadRequestError) {
            throw error;
        }
        throw new InternalServerError("Internal server error");
    }
};
export const updateUserPasswordService = async (user_id, oldPassword, newPassword) => {
    try {
        const existingUser = await getUserById(user_id);
        if (!existingUser) {
            throw new NotFoundError("User not found");
        }
        //* Verify old password matches before updating
        const isPasswordValid = await compare(oldPassword, existingUser.password);
        if (!isPasswordValid) {
            throw new BadRequestError("Current password is incorrect");
        }
        const hashedPassword = await hash(newPassword, 10);
        const updatedPassword = await updatePassword(user_id, hashedPassword);
        if (!updatedPassword) {
            throw new BadRequestError("Failed to update password");
        }
        const user = await getUserById(user_id);
        const { password: _, ...userWithoutPassword } = user || {};
        return userWithoutPassword;
    }
    catch (error) {
        console.error(`Error updating password: ${error}`);
        if (error instanceof NotFoundError || error instanceof BadRequestError) {
            throw error;
        }
        throw new InternalServerError("Internal server error");
    }
};
export const deactivateUserService = async (user_id) => {
    try {
        const existingUser = await getUserById(user_id);
        if (!existingUser) {
            throw new NotFoundError("User not found");
        }
        const deactivated = await deactivateUser(user_id);
        if (!deactivated) {
            throw new BadRequestError("Failed to deactivate user");
        }
        const user = await getUserById(user_id);
        const { password: _, ...userWithoutPassword } = user || {};
        return userWithoutPassword;
    }
    catch (error) {
        console.error(`Error deactivating user: ${error}`);
        if (error instanceof NotFoundError || error instanceof BadRequestError) {
            throw error;
        }
        throw new InternalServerError("Internal server error");
    }
};
export const activateUserService = async (user_id) => {
    try {
        const existingUser = await getUserById(user_id);
        if (!existingUser) {
            throw new NotFoundError("User not found");
        }
        const activated = await activateUser(user_id);
        if (!activated) {
            throw new BadRequestError("Failed to activate user");
        }
        const user = await getUserById(user_id);
        const { password: _, ...userWithoutPassword } = user || {};
        return userWithoutPassword;
    }
    catch (error) {
        console.error(`Error activating user: ${error}`);
        if (error instanceof NotFoundError || error instanceof BadRequestError) {
            throw error;
        }
        throw new InternalServerError("Internal server error");
    }
};
