import authRoutes from "./auth/route";
import userRoutes from "./user/route";
import groupRoutes from "./group/route";
import groupMemberRoutes from "./groupMember/route";
import { teacherRoutes } from "./teacherGroup/route";


export const routes = [ 
    authRoutes, 
    userRoutes,
    groupRoutes,
    groupMemberRoutes,
    teacherRoutes
] as const;

export type AppRoutes = (typeof routes)[number];
