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
    role ENUM('admin', 'student', 'teacher') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- indexes for users table
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_full_name ON users(full_name);

-- default admin account
INSERT INTO users (username, password, email, full_name, phone_number, gender, role)
VALUES ('admin_educollab2025', '$2b$12$dcXRmebh/DqLh4plrwB7juJQDjVTzbCpTFvi2/mMJzAEGWaxv3g32', 'eduCollab@gmail.com', 'System Administrator', '09922031958', 'male', 'admin');

CREATE TABLE groups (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT, 
    created_by INT NOT NULL,
    group_code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- indexes for groups table
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_groups_name ON groups(name);
CREATE INDEX idx_groups_created_at ON groups(created_at);

CREATE TABLE group_members (
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (group_id, user_id), 
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- index for group_members table
CREATE INDEX idx_group_members_user_id ON group_members(user_id);

CREATE TABLE teacher_group_invitations (
    invitation_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    project_details TEXT,
    invited_teacher_id INT NOT NULL,
    invited_by INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'Pending' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invited_by) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (invited_teacher_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- indexes for teacher_group_invitations table
CREATE INDEX idx_teacher_group_invitations_group_id ON teacher_group_invitations(group_id);
CREATE INDEX idx_teacher_group_invitations_invited_teacher_id ON teacher_group_invitations(invited_teacher_id);
CREATE INDEX idx_teacher_group_invitations_status ON teacher_group_invitations(status);

CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    type ENUM('Assignment', 'Project', 'Activity') NOT NULL,
    description TEXT,
    due_date DATE,
    status ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE CASCADE,    
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE
);

-- indexes for tasks table
CREATE INDEX idx_tasks_group_id ON tasks(group_id);
CREATE INDEX idx_tasks_uploaded_by ON tasks(uploaded_by);
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
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE
);

-- indexes for files table
CREATE INDEX idx_files_group_id ON files(group_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_uploaded_at ON files(uploaded_at);
CREATE INDEX idx_files_file_name ON files(file_name);


CREATE TABLE Messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES Groups(group_id),
    FOREIGN KEY (sender_id) REFERENCES Users(user_id)
);

-- indexes for messages table
CREATE INDEX idx_messages_group_id ON messages(group_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_content ON messages(content);

CREATE TABLE feedbacks (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    teacher_id INT NOT NULL,
    comment TEXT,
    grade INT,
    provided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE 
);

-- indexes for feedbacks table
CREATE INDEX idx_feedbacks_group_id ON feedbacks(group_id);
CREATE INDEX idx_feedbacks_teacher_id ON feedbacks(teacher_id);
CREATE INDEX idx_feedbacks_provided_at ON feedbacks(provided_at);
CREATE INDEX idx_feedbacks_grade ON feedbacks(grade);