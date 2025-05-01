import conn from "@/config/database";
import { User } from "@/types/index";

export const getAllUsers = async (): Promise <User[]> => {
  try {
    const sql = "SELECT * FROM users";
    const [result] = await conn.execute(sql);
    return result as User[];
  } catch (error) {
    console.error(`Error fetching users: ${error}`);
    throw error;
  }
};

export const getUserById = async (id: number): Promise<User | null>=> {
  try {
    const sql = "SELECT * FROM users WHERE user_id = ?";
    const [result] = await conn.execute(sql, [id]);
    return (result as User[])[0] || null;
  } catch (error) {
    console.error(`Error fetching user: ${error}`);
    throw error;
  }
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const sql = "SELECT * FROM users WHERE username = ?";
    const [result] = await conn.execute(sql, [username]);
    return (result as User[])[0] || null;
  } catch (error) {
    console.error(`Error fetching user: ${error}`);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const sql = "SELECT * FROM users WHERE email = ?";
    const [result] = await conn.execute(sql, [email]);
    return (result as User[])[0] || null;
  } catch (error) {
    console.error(`Error fetching user: ${error}`);
    throw error;
  }
};

export const createUser = async (user: User): Promise<User[]> => {
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

export const updateUser = async (id: number, user: Partial<User>): Promise<User | null> => {
  try {
    const sql = "UPDATE users SET username = ?, email = ?, full_name = ?, phone_number = ?, gender = ? WHERE user_id = ?";
    const [result] = await conn.execute(sql, [
      user.username,
      user.email,
      user.full_name,
      user.phone_number,
      user.gender,
      id
    ]);
  
    return (result as any).affectedRows;
  } catch (error) {
    console.error(`Error updating user: ${error}`);
    throw error;
  }
};

export const updatePassword = async (id: number, password: string): Promise<User | null> => {
  try {
    const sql = "UPDATE users SET password = ? WHERE user_id = ?";
    const [result] = await conn.execute(sql, [password, id]);
    return (result as any).affectedRows; 
  } catch (error) {
    console.error(`Error updating password: ${error}`);
    throw error;
  }
}

export const deactivateUser = async (id: number): Promise<boolean> => {
  try {
    const sql = "UPDATE users SET is_active = 0 WHERE user_id = ?";
    const [result] = await conn.execute(sql, [id]);
    return (result as any).affectedRows > 0;
  } catch (error) {
    console.error(`Error deactivating user: ${error}`);
    throw error;
  }
};

export const activateUser = async (id: number): Promise<boolean> => {
  try {
    const sql = "UPDATE users SET is_active = 1 WHERE user_id = ?";
    const [result] = await conn.execute(sql, [id]);
    return (result as any).affectedRows > 0;
  } catch (error) {
    console.error(`Error activating user: ${error}`);
    throw error;
  }
};