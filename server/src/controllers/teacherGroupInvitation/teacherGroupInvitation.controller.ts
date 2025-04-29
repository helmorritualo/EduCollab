import { Context } from "hono";
import {
  createTeacherGroupInvitationService,
  getInvitationsForTeacherService,
  respondToInvitationService,
} from "@/services/teacherGroupInvitation.service";
import { BadRequestError, NotFoundError } from "@/utils/error";

export const createTeacherGroupInvitation = async (c: Context) => {
  try {
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
        invitation_id: invitation
      },
      201
    );
  } catch (error) {
    console.error("Error in createTeacherGroupInvitation:", error);
    if (error instanceof BadRequestError) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        400
      );
    }
    return c.json(
      {
        success: false,
        message: "Failed to create invitation",
      },
      500
    );
  }
};

export const getInvitationsForTeacher = async (c: Context) => {
  try {
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
  } catch (error) {
    console.error("Error in getInvitationsForTeacher:", error);
    if (error instanceof NotFoundError) {
      return c.json(
        {
          success: false,
          message: error.message,
          invitations: [],
        },
        200 
      );
    }
    return c.json(
      {
        success: false,
        message: "Failed to retrieve invitations",
      },
      500
    );
  }
};

export const respondToInvitation = async (c: Context) => {
  try {
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
  } catch (error) {
    console.error("Error in respondToInvitation:", error);
    if (error instanceof NotFoundError) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        404
      );
    }
    return c.json(
      {
        success: false,
        message: "Failed to respond to invitation",
      },
      500
    );
  }
};
