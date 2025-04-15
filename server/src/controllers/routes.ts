import authRoutes from "./auth/route";
import userRoutes from "./user/route";

export const routes = [ 
    authRoutes, 
    userRoutes
] as const;

export type AppRoutes = (typeof routes)[number];
