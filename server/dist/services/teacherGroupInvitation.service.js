import conn from "@/config/database";
import { createTeacherGroupInvitationByNames, getInvitationsForTeacher, respondToInvitation, } from "@/models/teacherGroupInvitation";
import { BadRequestError, NotFoundError } from "@/utils/error";
export const createTeacherGroupInvitationByNamesService = async (group_name, invited_teacher_name, invited_by, project_details) => {
    // Validate inputs
    if (!group_name || group_name.trim() === "") {
        throw new BadRequestError("Group name cannot be empty");
    }
    if (!invited_teacher_name || invited_teacher_name.trim() === "") {
        throw new BadRequestError("Teacher name cannot be empty");
    }
    if (!project_details || project_details.trim() === "") {
        throw new BadRequestError("Project details cannot be empty");
    }
    try {
        // Check if there's already a pending invitation
        const existingInvitation = await checkExistingInvitation(group_name, invited_teacher_name);
        if (existingInvitation) {
            throw new BadRequestError("An invitation for this teacher in this group already exists");
        }
        const invitation = await createTeacherGroupInvitationByNames(group_name, invited_teacher_name, invited_by, project_details);
        if (!invitation) {
            throw new BadRequestError("Failed to create invitation");
        }
        return invitation;
    }
    catch (error) {
        console.error("Error creating invitation:", error);
        if (error instanceof BadRequestError) {
            throw error;
        }
        throw new BadRequestError(error instanceof Error ? error.message : "Failed to create invitation");
    }
};
// Helper function to check for existing invitations
const checkExistingInvitation = async (group_name, teacher_name) => {
    try {
        const sql = `
      SELECT i.*
      FROM teacher_group_invitations i
      JOIN groups g ON i.group_id = g.group_id
      JOIN users u ON i.invited_teacher_id = u.user_id
      WHERE g.name = ? AND u.full_name = ? AND i.status = 'pending'
    `;
        const [result] = await conn.execute(sql, [group_name, teacher_name]);
        return result.length > 0;
    }
    catch (error) {
        console.error("Error checking existing invitation:", error);
        return false;
    }
};
export const getInvitationsForTeacherService = async (teacher_id) => {
    try {
        const invitations = await getInvitationsForTeacher(teacher_id);
        if (!invitations || invitations.length === 0) {
            throw new NotFoundError("No invitations found for the teacher");
        }
        return invitations;
    }
    catch (error) {
        console.error("Error fetching invitations:", error);
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw error;
    }
};
export const respondToInvitationService = async (invitation_id, status) => {
    try {
        const invitation = await respondToInvitation(invitation_id, status);
        if (!invitation) {
            throw new NotFoundError("Invitation not found");
        }
        return invitation;
    }
    catch (error) {
        console.error("Error responding to invitation:", error);
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw error;
    }
};
