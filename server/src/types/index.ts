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
  group_code: string;
  created_by: number;
};

export type GroupWithCreator = Group & {
  full_name: string;
};
