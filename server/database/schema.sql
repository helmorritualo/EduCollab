CREATE DATABASE educallab;

USE educallab;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    role ENUM('admin', 'student', 'teacher') NOT NULL
);

-- Add indexes for users table
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_full_name ON users(full_name);

CREATE TABLE groups (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT, 
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Add indexes for groups table
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_groups_name ON groups(name);
CREATE INDEX idx_groups_created_at ON groups(created_at);

CREATE TABLE group_members (
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (group_id, user_id), -- to ensure uniqueness per user-group combination
    FOREIGN KEY (group_id) REFERENCES groups(group_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Add index for group_members table
CREATE INDEX idx_group_members_user_id ON group_members(user_id);

CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    type ENUM('Assignment', 'Quiz', 'Project', 'Activity') NOT NULL,
    description TEXT,
    assigned_to INT NOT NULL,
    due_date DATE,
    status ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id),    
    FOREIGN KEY (group_id) REFERENCES groups(group_id)
);

-- Add indexes for tasks table
CREATE INDEX idx_tasks_group_id ON tasks(group_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_subject ON tasks(subject);
CREATE INDEX idx_tasks_type ON tasks(type);

CREATE TABLE files (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id),
    FOREIGN KEY (group_id) REFERENCES groups(group_id)
);

-- Add indexes for files table
CREATE INDEX idx_files_group_id ON files(group_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_uploaded_at ON files(uploaded_at);
CREATE INDEX idx_files_file_name ON files(file_name);

CREATE TABLE teacher_groups (
    teacher_id INT NOT NULL,
    group_id INT NOT NULL,
    PRIMARY KEY (teacher_id, group_id),
    FOREIGN KEY (teacher_id) REFERENCES users(user_id),
    FOREIGN KEY (group_id) REFERENCES groups(group_id) 
);

CREATE TABLE feedbacks (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    teacher_id INT NOT NULL,
    comment TEXT,
    grade INT,
    provided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(user_id),
    FOREIGN KEY (group_id) REFERENCES groups(group_id) 
);

-- Add indexes for feedbacks table
CREATE INDEX idx_feedbacks_group_id ON feedbacks(group_id);
CREATE INDEX idx_feedbacks_teacher_id ON feedbacks(teacher_id);
CREATE INDEX idx_feedbacks_provided_at ON feedbacks(provided_at);
CREATE INDEX idx_feedbacks_grade ON feedbacks(grade);