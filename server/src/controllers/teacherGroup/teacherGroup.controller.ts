import { Context } from "hono";
import { getGroupsByTeacherService } from "@/services/teacherGroup.service";
import { NotFoundError } from "@/utils/error";

export const getGroupsByTeacher = async (c: Context) => {
  try {
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
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(
        {
          success: false,
          message: error.message,
          groups: [],
        },
        200
      );
    }
    return c.json(
      {
        success: false,
        message: "Failed to get groups by teacher",
      },
      500
    );
  }
};