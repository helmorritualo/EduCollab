import conn from "@/config/database";
export const createTeacherGroupInvitationByNames = async (group_name, invited_teacher_name, invited_by, project_details) => {
    try {
        // First, get the group_id from the group_name
        const groupSql = `SELECT group_id FROM groups WHERE name = ?`;
        const [groupResult] = await conn.execute(groupSql, [group_name]);
        const groupRows = groupResult;
        if (groupRows.length === 0) {
            throw new Error(`Group with name '${group_name}' not found`);
        }
        const group_id = groupRows[0].group_id;
        // Then, get the teacher_id from the teacher_name
        const teacherSql = `
      SELECT user_id
      FROM users
      WHERE full_name = ? AND role = 'teacher' AND user_id != ?
    `;
        const [teacherResult] = await conn.execute(teacherSql, [
            invited_teacher_name,
            invited_by,
        ]);
        const teacherRows = teacherResult;
        if (teacherRows.length === 0) {
            throw new Error(`Teacher with name '${invited_teacher_name}' not found`);
        }
        const invited_teacher_id = teacherRows[0].user_id;
        // Now create the invitation with the resolved IDs
        const sql = `
      INSERT INTO teacher_group_invitations
        (group_id, invited_teacher_id, invited_by, project_details, status)
      VALUES (?, ?, ?, ?, 'pending')
    `;
        const [result] = await conn.execute(sql, [
            group_id,
            invited_teacher_id,
            invited_by,
            project_details,
        ]);
        // Return complete invitation details
        const invitationSql = `
      SELECT
        i.invitation_id,
        i.project_details,
        i.status,
        i.created_at,
        i.updated_at,
        g.group_id,
        g.name as group_name,
        u_inviter.full_name as inviter_name,
        u_teacher.full_name as teacher_name
      FROM teacher_group_invitations i
      JOIN groups g ON i.group_id = g.group_id
      JOIN users u_inviter ON i.invited_by = u_inviter.user_id
      JOIN users u_teacher ON i.invited_teacher_id = u_teacher.user_id
      WHERE i.invitation_id = ?
    `;
        const [invitationResult] = await conn.execute(invitationSql, [
            result.insertId,
        ]);
        return invitationResult[0];
    }
    catch (error) {
        console.error(`Error creating invitation: ${error}`);
        throw error;
    }
};
export const getInvitationsForTeacher = async (teacher_id) => {
    try {
        const sql = `
      SELECT
        i.invitation_id,
        i.project_details,
        i.status,
        i.created_at,
        i.updated_at,
        g.group_id,
        g.name as group_name,
        u.full_name as inviter_name
      FROM teacher_group_invitations i
      JOIN groups g ON i.group_id = g.group_id
      JOIN users u ON i.invited_by = u.user_id
      WHERE i.invited_teacher_id = ?
      ORDER BY i.created_at DESC
    `;
        const [result] = await conn.execute(sql, [teacher_id]);
        return result;
    }
    catch (error) {
        console.error(`Error fetching invitations: ${error}`);
        throw error;
    }
};
/**
 * Updates invitation status and assigns teacher if accepted.
 */
export const respondToInvitation = async (invitation_id, status) => {
    const connection = await conn.getConnection();
    try {
        await connection.beginTransaction();
        // First check if invitation exists and is pending
        const checkSql = `
      SELECT i.*, g.group_id, i.invited_teacher_id
      FROM teacher_group_invitations i
      JOIN groups g ON i.group_id = g.group_id
      WHERE i.invitation_id = ? AND i.status = 'pending'
    `;
        const [checkResult] = await connection.execute(checkSql, [invitation_id]);
        if (checkResult.length === 0) {
            throw new Error("Invitation not found or already processed");
        }
        const invitation = checkResult[0];
        // Update invitation status
        const sql = `
      UPDATE teacher_group_invitations
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE invitation_id = ?
    `;
        await connection.execute(sql, [status, invitation_id]);
        if (status === "approved") {
            try {
                // Add to teacher_groups table
                const assignTeacherSql = `
          INSERT INTO teacher_groups (group_id, teacher_id)
          VALUES (?, ?)
        `;
                await connection.execute(assignTeacherSql, [
                    invitation.group_id,
                    invitation.invited_teacher_id,
                ]);
                // Add to group_members table if not already a member
                const addMemberSql = `
          INSERT INTO group_members (group_id, user_id)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE group_id = group_id
        `;
                await connection.execute(addMemberSql, [
                    invitation.group_id,
                    invitation.invited_teacher_id,
                ]);
            }
            catch (error) {
                throw new Error("Failed to add teacher to group");
            }
        }
        // Return updated invitation details
        const invitationSql = `
      SELECT
        i.invitation_id,
        i.project_details,
        i.status,
        i.created_at,
        i.updated_at,
        g.group_id,
        g.name as group_name,
        u_inviter.full_name as inviter_name,
        u_teacher.full_name as teacher_name
      FROM teacher_group_invitations i
      JOIN groups g ON i.group_id = g.group_id
      JOIN users u_inviter ON i.invited_by = u_inviter.user_id
      JOIN users u_teacher ON i.invited_teacher_id = u_teacher.user_id
      WHERE i.invitation_id = ?
    `;
        const [invitationResult] = await connection.execute(invitationSql, [
            invitation_id,
        ]);
        await connection.commit();
        return invitationResult[0];
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
};
