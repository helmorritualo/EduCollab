# EduCollab System

<div align="center">

**A modern educational collaboration platform for students and teachers**

</div>

## 📋 Overview

EduCollab is a comprehensive full-stack application designed to facilitate educational collaboration between teachers and students. The platform enables task management, file sharing, and communication in a structured educational environment.

**Key Features:**
- Task creation and assignment
- File upload/download for educational materials
- Collaborative workspaces
- User role management (teachers, students, administrators)

## 🔍 Project Structure

The EduCollab System consists of:

- **Client**: A React + TypeScript frontend built with Vite
- **Server**: A Node.js backend using Hono framework with MySQL database

## 🛠️ Prerequisites

Before setting up the project, ensure you have the following installed:

- Node.js (v16 or higher)
- npm (v7 or higher)
- MySQL (v8 or higher)
- Git

## 🚀 Getting Started

Follow these steps to set up the EduCollab System on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/helmorritualo/EduCollab.git
```

### 2. Database Setup

1. Install MySQL if you haven't already
2. Create a new database named `educallab`
3. Import the provided schema:
   ```bash
   mysql -u your_username -p educallab < database/schema.sql
   ```

### 3. Server Setup

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create a .env file with the following variables:
```

Create a `.env` file in the server directory with these configurations:
```
DB_HOST=localhost // for local development using xampp
DB_PORT=3306 // default port for xampp
DB_USER=root  // default username for xampp
DB_PASSWORD= // default password for xampp
DB_NAME=educallab // database name
JWT_SECRET=your_jwt_secret_key 
PORT=5000 // default port for development server
```

```bash
# Start the development server
npm run dev
```

The server will run at http://localhost:5000

### 4. Client Setup

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The client will run at http://localhost:3000

## 💻 Development

### Server

- **Framework**: Hono.js
- **Database**: MySQL
- **Language**: TypeScript
- **API**: RESTful API endpoints for data access
- **File System**: Handles PDF and document files for educational tasks

### Client

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **File Handling**: Supports uploading and downloading educational materials

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

