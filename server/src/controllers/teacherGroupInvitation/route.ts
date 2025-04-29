import { authenticate } from "@/middlewares/authentication";
import {
  createTeacherGroupInvitation,
  getInvitationsForTeacher,
  respondToInvitation,
} from "./teacherGroupInvitation.controller";
import { Hono } from "hono";

export const teacherGroupInvitationRouter = new Hono()
  .post("/teacher-group-invitations", authenticate, createTeacherGroupInvitation)
  .get("/teacher-group-invitations", authenticate, getInvitationsForTeacher)
  .patch("/teacher-group-invitations/:invitation_id", authenticate, respondToInvitation);
