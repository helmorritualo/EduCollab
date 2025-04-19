export type User = {
  user_id: number;
  username: string;
  password: string;
  email: string;
  full_name: string;
  phone_number: string;
  gender: string;
  role: string;
};

export type Group = {
  group_id: number;
  name: string;
  description: string;
  created_by: number;
  created_at: Date;
};

export type GroupMember = {
  group_id: number;
  user_id: number;
};

export type TeacherGroup = {
  teacher_id: number;
  group_id: number;
};

export type GroupWithCreator = Group & {
  username: string;
  full_name: string;
  email: string;
};

export type GroupWithMembers = Group & {
  members: User[];
};

export type GroupWithTeachers = Group & {
  teachers: User[];
};

export type CompleteGroup = Group & {
  members: User[];
  teachers: User[];
};
