import { NotFoundError } from "@/utils/error";
import { getGroupsByTeacher } from "@/models/teacherGroup";

export const getGroupsByTeacherService = async (
  teacher_id: number
) => {
  try {
    const groups = await getGroupsByTeacher(teacher_id);
    if (!groups || groups.length === 0) {
      throw new NotFoundError("No groups found for the teacher");
    }
    return groups;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
  }
};