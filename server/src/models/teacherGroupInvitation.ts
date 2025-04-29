import conn from "@/config/database";

export const createTeacherGroupInvitation = async (
  group_id: number,
  invited_teacher_id: number,
  invited_by: number,
  project_details: string
) => {
  
  try {
    const sql = `
    INSERT INTO teacher_group_invitations (group_id, invited_teacher_id, invited_by, project_details)
    VALUES (?, ?, ?, ?)
  `;
    const [result] = await conn.execute(sql, [
      group_id,
      invited_teacher_id,
      invited_by,
      project_details,
    ]);
    return (result as any).insertId;
  } catch (error) {
    console.error(`Error creating invitation: ${error}`);
    throw error;
  }
};

export const getInvitationsForTeacher = async (teacher_id: number) => {
  try {
    // use join to get the invitation details and the student name
    const sql = `
    SELECT
      i.invitation_id,
      g.name AS group_name,
      i.project_details,
      i.status,
      g.name AS group_name,
      u.full_name AS invited_by
    FROM teacher_group_invitations i
    JOIN groups g ON i.group_id = g.group_id
    JOIN users u ON i.invited_by = u.user_id
    WHERE i.invited_teacher_id = ?
    `;
    const [result] = await conn.execute(sql, [teacher_id]);
    return result as any[];
  } catch (error) {
    console.error(`Error fetching invitations: ${error}`);
    throw error;
  }
};

/**
 * Updates invitation status and assigns teacher if approved.
 */
export const respondToInvitation = async (
  invitation_id: number,
  status: "approved" | "rejected"
) => {
  try {
    const sql = `
    UPDATE teacher_group_invitations SET status = ? WHERE invitation_id = ?
  `;
    await conn.execute(sql, [status, invitation_id]);
    
    if (status === "approved") {
      // Assign teacher to group
      const assignSql = `
      INSERT INTO teacher_groups (group_id, teacher_id)
      SELECT group_id, invited_teacher_id FROM teacher_group_invitations WHERE invitation_id = ?
    `;
      await conn.execute(assignSql, [invitation_id]);
    }
    return true;
  } catch (error) {
    console.error(`Error responding to invitation: ${error}`);
    throw error;
  }
};
