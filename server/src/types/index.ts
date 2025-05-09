export type User = {
  user_id: number;
  username: string;
  password: string;
  email: string;
  full_name: string;
  phone_number: string;
  gender: string;
  role: string;
  is_active: boolean;
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

export type Task = {
  task_id?: number;
  title: string;
  description: string;
  status: string;
  due_date: string;
  group_id: number;
  assigned_to?: number | null;
  created_by: number;
  created_at?: string;
  updated_at?: string;
};

export type TaskWithDetails = Task & {
  group_name?: string;
  creator_name: string;
};

export interface FileUpload {
  file_id?: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  task_id?: number | null;
  group_id: number;
  uploaded_by: number;
  uploaded_at?: Date;
}

export interface GroupMember {
  user_id: number;
  group_id: number;
  role?: string;
}

export interface FileUploadWithDetails extends FileUpload {
  uploader: {
    username: string;
    full_name: string;
  };
  group: {
    name: string;
  };
}
