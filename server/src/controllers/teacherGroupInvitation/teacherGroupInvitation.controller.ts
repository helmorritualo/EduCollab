import { Context } from "hono";
import {
  createTeacherGroupInvitationService,
  getInvitationsForTeacherService,
  respondToInvitationService,
} from "@/services/teacherGroupInvitation.service";

export const createTeacherGroupInvitation = async (c: Context) => {
  const { group_id, invited_teacher_id, project_details } = await c.req.json();
  const invited_by = c.get("user_id");

  const invitation = await createTeacherGroupInvitationService(
    Number(group_id),
    Number(invited_teacher_id),
    invited_by,
    project_details
  );

  return c.json(
    {
      success: true,
      message: "Invitation created successfully",
      invitation_id: invitation,
    },
    201
  );
};

export const getInvitationsForTeacher = async (c: Context) => {
  const teacher_id = c.get("user_id");
  const invitations = await getInvitationsForTeacherService(teacher_id);

  return c.json(
    {
      success: true,
      message: "Invitations retrieved successfully",
      invitations,
    },
    200
  );
};

export const respondToInvitation = async (c: Context) => {
  const { status } = await c.req.json();
  const invitation_id = c.req.param("invitation_id");

  if (
    !invitation_id ||
    !status ||
    (status !== "approved" && status !== "rejected")
  ) {
    return c.json(
      {
        success: false,
        message: "Invalid invitation ID or status",
      },
      400
    );
  }

  await respondToInvitationService(Number(invitation_id), status);

  return c.json(
    {
      success: true,
      message: `Invitation ${status} successfully`,
    },
    200
  );
};
