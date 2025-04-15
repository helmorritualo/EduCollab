import conn from "@/config/database";
import { User } from "@/types/index";

export const getAllUsers = async () => {
  try {
    const sql = "SELECT * FROM users";
    const [result] = await conn.execute(sql);
    return result as User[];
  } catch (error) {
    console.error(`Error fetching users: ${error}`);
    throw error;
  }
};

export const getUserById = async (id: number) => {
  try {
    const sql = "SELECT * FROM users WHERE user_id = ?";
    const [result] = await conn.execute(sql, [id]);
    return (result as User[])[0] || null;
  } catch (error) {
    console.error(`Error fetching user: ${error}`);
    throw error;
  }
};

export const getUserByUsername = async (username: string) => {
  try {
    const sql = "SELECT * FROM users WHERE username = ?";
    const [result] = await conn.execute(sql, [username]);
    return (result as User[])[0] || null;
  } catch (error) {
    console.error(`Error fetching user: ${error}`);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const sql = "SELECT * FROM users WHERE email = ?";
    const [result] = await conn.execute(sql, [email]);
    return (result as User[])[0] || null;
  } catch (error) {
    console.error(`Error fetching user: ${error}`);
    throw error;
  }
};

export const createUser = async (user: User) => {
  try {
    const sql = "INSERT INTO users (username, password, email, full_name, phone_number, gender, role) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const [result] = await conn.execute(sql, [
      user.username,
      user.password,
      user.email,
      user.full_name,
      user.phone_number,
      user.gender,
      user.role
    ]);
    
    return (result as any).insertId;
  } catch (error) {
    console.error(`Error creating user: ${error}`);
    throw error;
  }
};

export const updateUser = async (id: number, user: User) => {
  try {
    const sql = "UPDATE users SET username = ?, email = ?, full_name = ?, phone_number = ?, gender = ?, role = ? WHERE user_id = ?";
    const [result] = await conn.execute(sql, [
      user.username,
      user.email,
      user.full_name,
      user.phone_number,
      user.gender,
      user.role,
      id
    ]);
  
    return (result as any).affectedRows;
  } catch (error) {
    console.error(`Error updating user: ${error}`);
    throw error;
  }
};

export const updatePassword = async (id: number, password: string) => {
  try {
    const sql = "UPDATE users SET password = ? WHERE user_id = ?";
    const [result] = await conn.execute(sql, [password, id]);
    return (result as any).affectedRows; 
  } catch (error) {
    console.error(`Error updating password: ${error}`);
    throw error;
  }
}

export const deleteUser = async (id: number) => {
  try {
    const sql = "DELETE FROM users WHERE user_id =?";
    const [result] = await conn.execute(sql, [id]);
    return (result as any).affectedRows;
  } catch (error) {
    console.error(`Error deleting user: ${error}`);
    throw error;
  }
};
