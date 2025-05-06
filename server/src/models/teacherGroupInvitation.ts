import conn from "@/config/database";

export const createTeacherGroupInvitationByNames = async (
  group_name: string,
  invited_teacher_name: string,
  invited_by: number,
  project_details: string
) => {
  try {
    // First, get the group_id from the group_name
    const groupSql = `SELECT group_id FROM groups WHERE name = ?`;
    const [groupResult] = await conn.execute(groupSql, [group_name]);
    const groupRows = groupResult as any[];
    
    if (groupRows.length === 0) {
      throw new Error(`Group with name '${group_name}' not found`);
    }
    
    const group_id = groupRows[0].group_id;
    
    // Then, get the teacher_id from the teacher_name
    const teacherSql = `SELECT user_id FROM users WHERE full_name = ? AND role = 'teacher'`;
    const [teacherResult] = await conn.execute(teacherSql, [invited_teacher_name]);
    const teacherRows = teacherResult as any[];
    
    if (teacherRows.length === 0) {
      throw new Error(`Teacher with name '${invited_teacher_name}' not found`);
    }
    
    const invited_teacher_id = teacherRows[0].user_id;
    
    // Now create the invitation with the resolved IDs
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
