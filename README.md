# EduCollab System

EduCollab System is a full-stack application designed to facilitate educational collaboration. This repository contains both the client and server components of the application.
This project is under development. 

## Project Overview

The EduCollab System consists of:

- **Client**: A React + TypeScript frontend built with Vite
- **Server**: A Node.js backend using Hono framework with MySQL database

## Prerequisites

Before setting up the project, ensure you have the following installed:

- Node.js (v16 or higher)
- npm (v7 or higher)
- MySQL (v8 or higher)
- Git

## Getting Started

### Cloning the Repository

```bash
git clone https://github.com/helmorritualo/EduCollab.git
```

## Server Setup

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create a .env file (if not exists) with the following variables
# DB_HOST=localhost
# DB_PORT=your_db_port
# DB_USER=your_db_user
# DB_PASSWORD= your_db_password
# DB_NAME=educallab
# JWT_SECRET=your_jwt_secret
# PORT=5000

# Set up the database
# Import the schema from database/schema.sql to your MySQL instance

# Start the development server
npm run dev
```

The server will be running at http://localhost:5000

## Client Setup

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The client will be running at http://localhost:3000

## Development

### Server

- Built with Hono.js framework
- Uses MySQL for database
- TypeScript for type safety

### Client

- Built with React 19
- Uses TypeScript
- Vite for fast development experience
- Tailwind CSS for styling

## Building for Production

### Server

```bash
cd server
npm run build
```

### Client

```bash
cd client
npm run build
```

The built client files will be in the `client/dist` directory, which can be served by any static file server.
