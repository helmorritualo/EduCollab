import { Hono } from "hono";
import {
  getGroupTeachers,
  assignTeacherToGroup,
  removeTeacherFromGroup,
} from "./teacherGroup.controller";
import { authenticate } from "@/middlewares/authentication";

const teacherGroupRouter = new Hono()
  .get("teacher-group/:group_id", authenticate, getGroupTeachers)
  .post("teacher-group/:group_id", authenticate, assignTeacherToGroup)
  .delete(
    "teacher-group/:group_id/:teacher_id",
    authenticate,
    removeTeacherFromGroup
  );

export default teacherGroupRouter;