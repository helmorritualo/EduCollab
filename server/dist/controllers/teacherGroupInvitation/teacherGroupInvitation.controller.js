import { createTeacherGroupInvitationByNamesService, getInvitationsForTeacherService, respondToInvitationService, } from "@/services/teacherGroupInvitation.service";
import { getGroupByName } from "@/models/group";
import { BadRequestError } from "@/utils/error";
export const createTeacherGroupInvitation = async (c) => {
    const { group_name, invited_teacher_name, project_details } = await c.req.json();
    const invited_by = Number(c.get("user_id"));
    const user_role = c.get("user_role");
    // Get group details to check ownership
    const group = await getGroupByName(group_name);
    if (!group) {
        throw new BadRequestError(`Group '${group_name}' not found`);
    }
    // Allow admins or student creators of the group to invite teachers
    if (user_role === "admin" ||
        (user_role === "student" && group.created_by === invited_by)) {
        const invitation = await createTeacherGroupInvitationByNamesService(group_name, invited_teacher_name, invited_by, project_details);
        return c.json({
            success: true,
            message: "Invitation created successfully",
            invitation: invitation,
        }, 201);
    }
};
export const getInvitationsForTeacher = async (c) => {
    const teacher_id = c.get("user_id");
    const invitations = await getInvitationsForTeacherService(teacher_id);
    return c.json({
        success: true,
        message: "Invitations retrieved successfully",
        invitations,
    }, 200);
};
export const respondToInvitation = async (c) => {
    const { status } = await c.req.json();
    const invitation_id = c.req.param("invitation_id");
    if (!invitation_id ||
        !status ||
        (status !== "approved" && status !== "rejected")) {
        return c.json({
            success: false,
            message: "Invalid invitation ID or status",
        }, 400);
    }
    const invitation = await respondToInvitationService(Number(invitation_id), status);
    return c.json({
        success: true,
        message: `Invitation ${status} successfully`,
        invitation,
    }, 200);
};
