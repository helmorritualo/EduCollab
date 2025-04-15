import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const conn = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function validateConnection() {
  try {
    const connection = await conn.getConnection();
    console.log("Database connection established successfully");
    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

validateConnection();

export default conn;
