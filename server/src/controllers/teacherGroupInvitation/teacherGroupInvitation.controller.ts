import { Context } from "hono";
import {
  createTeacherGroupInvitationByNamesService,
  getInvitationsForTeacherService,
  respondToInvitationService,
} from "@/services/teacherGroupInvitation.service";

export const createTeacherGroupInvitation = async (c: Context) => {
  const { group_name, invited_teacher_name, project_details } = await c.req.json();
  const invited_by = c.get("user_id");

  const invitation = await createTeacherGroupInvitationByNamesService(
    group_name,
    invited_teacher_name,
    invited_by,
    project_details
  );

  return c.json(
    {
      success: true,
      message: "Invitation created successfully",
      invitation: invitation
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
