import {
  createTeacherGroupInvitationByNames,
  getInvitationsForTeacher,
  respondToInvitation,
} from "@/models/teacherGroupInvitation";
import { BadRequestError, NotFoundError } from "@/utils/error";

export const createTeacherGroupInvitationByNamesService = async (
  group_name: string,
  invited_teacher_name: string,
  invited_by: number,
  project_details: string
) => {
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
    const invitation = await createTeacherGroupInvitationByNames(
      group_name,
      invited_teacher_name,
      invited_by,
      project_details
    );

    if (!invitation) {
      throw new BadRequestError("Failed to create invitation");
    }
    return invitation;
  } catch (error) {
    console.error("Error creating invitation:", error);
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw error;
  }
};


export const getInvitationsForTeacherService = async (teacher_id: number) => {
  try {
    const invitations = await getInvitationsForTeacher(teacher_id);
    if (!invitations || invitations.length === 0) {
      throw new NotFoundError("No invitations found for the teacher");
    }
    return invitations;
  } catch (error) {
    console.error("Error fetching invitations:", error);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw error;
  }
};

export const respondToInvitationService = async (
  invitation_id: number,
  status: "approved" | "rejected"
) => {
  try {
    const invitation = await respondToInvitation(invitation_id, status);
    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }
    return invitation;
  } catch (error) {
    console.error("Error responding to invitation:", error);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw error;
  }
};
