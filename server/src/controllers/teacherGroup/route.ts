import { Hono } from "hono";
import { getGroupsByTeacher } from "./teacherGroup.controller";
import { authenticate } from "@/middlewares/authentication";

export const teacherRoutes = new Hono().get(
  "/teachers/groups",
  authenticate,
  getGroupsByTeacher
);
