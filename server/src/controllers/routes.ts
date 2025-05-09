import authRoutes from "./auth/route";
import userRoutes from "./user/route";
import groupRoutes from "./group/route";
import groupMemberRoutes from "./groupMember/route";
import { teacherGroupInvitationRoutes } from "./teacherGroupInvitation/route";
import taskRoutes from "./task/route";
import fileUploadRoutes from "./fileUpload/route";

export const routes = [
  authRoutes,
  userRoutes,
  groupRoutes,
  groupMemberRoutes,
  teacherGroupInvitationRoutes,
  taskRoutes,
  fileUploadRoutes,
] as const;

export type AppRoutes = (typeof routes)[number];
