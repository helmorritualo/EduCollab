import conn from "@/config/database";

/**
 * Retrieves all groups overseen by a specific teacher.
 * @param teacher_id The teacher's user ID.
 * @returns Promise<any[]> List of groups.
 */
export const getGroupsByTeacher = async (
  teacher_id: number
) => {
  try {
    const sql = `
      SELECT g.*
      FROM groups g
      JOIN teacher_groups tg ON g.group_id = tg.group_id
      WHERE tg.teacher_id = ?
    `;
    const [result] = await conn.execute(sql, [teacher_id]);
    return result as any[];
  } catch (error) {
    console.error("Error fetching groups by teacher:", error);
    throw error;
  }
};