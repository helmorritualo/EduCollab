import { Context } from "hono";
import { getGroupsByTeacherService } from "@/services/teacherGroup.service";
import { NotFoundError } from "@/utils/error";

export const getGroupsByTeacher = async (c: Context) => {
  const teacher_id = c.get("user_id");
  const groups = await getGroupsByTeacherService(Number(teacher_id));
  return c.json(
    {
      success: true,
      message: "Get groups by teacher successfully",
      groups,
    },
    200
  );
};
