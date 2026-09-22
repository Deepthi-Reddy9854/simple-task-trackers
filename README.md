# Simple Task Tracker

A full-stack MERN application for task management with Google authentication, custom email/password authentication, real-time status filtering, interactive modals, and glassmorphic UI.

## Features
- **User Authentication**: Google Auth integration and custom email/password login with strict password verification.
- **Password Recovery**: Interactive "Forgot Password" modal with automatic account setup & update.
- **Task Management**: Real-time CRUD operations for tasks (Title, Description, Priority, Status, Due Date).
- **Responsive Dashboard**: Filter tasks by status (All, Pending, In Progress, Completed), search tasks dynamically, and view quick stats.
- **Modern UI/UX**: Modern dark glassmorphic layout, clean authentication card, and toast notification alerts.

## Project Structure
```text
simple-task-tracker/
├── backend/          # Express.js REST API with MongoDB / MongoMemoryServer
│   ├── config/       # Database connection
│   ├── controllers/  # Auth & Task business logic
│   ├── models/       # Mongoose User & Task schemas
│   └── routes/       # API endpoints
└── frontend/         # React application built with Vite & Lucide icons
    └── src/          # Components, pages, context, and styling
```

## Setup & Running Locally

1. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   - Frontend runs on: `http://localhost:3000`
   - Backend API runs on: `http://localhost:5000`
