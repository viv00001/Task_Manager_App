# 📋 TaskFlow - Team Task Manager

## 🌐 Live Demo

**Your Live URL Here:** `https://your-app.up.railway.app`

---

## 📝 Project Overview

TaskFlow is a **full-stack team task management application** built for the Full-Stack Developer Assessment. It allows teams to collaborate on projects, assign tasks, track progress, and manage work with different permission levels.

### 🎯 Why I Built This

I created TaskFlow to solve a real problem many teams face - keeping track of who is doing what. Whether you're managing a small team or a large department, TaskFlow gives you clarity on project status, task assignments, and deadlines.

---

## ✨ Features (All Requirements Completed)

### 🔐 Authentication System
| Feature | Status | Description |
|---------|--------|-------------|
| User Signup | ✅ | Create new account with name, email, password |
| User Login | ✅ | Secure login with password verification |
| Password Security | ✅ | Passwords hashed using bcrypt (industry standard) |
| Session Management | ✅ | User stays logged in during browser session |

### 📁 Project Management
| Feature | Status | Who Can Use |
|---------|--------|-------------|
| Create Projects | ✅ | Only Admin |
| View All Projects | ✅ | Admin sees all, Member sees assigned only |
| Delete Projects | ✅ | Only Admin (with cascade delete of tasks) |
| Project Descriptions | ✅ | Add details to each project |

### ✅ Task Management
| Feature | Status | Description |
|---------|--------|-------------|
| Create Tasks | ✅ | Add title, assignee, due date, project |
| Assign Tasks | ✅ | Assign to any registered user by email |
| Status Tracking | ✅ | 3 statuses: Pending → In Progress → Done |
| Due Date Tracking | ✅ | Set deadlines for each task |
| Overdue Detection | ✅ | Tasks past due date turn red automatically |
| Real-time Updates | ✅ | Status changes reflect immediately |

### 📊 Dashboard Analytics
| Metric | Description |
|--------|-------------|
| Total Tasks | Count of all tasks in system |
| Pending Tasks | Tasks not started yet |
| In Progress | Tasks being worked on |
| Completed | Finished tasks |
| Overdue | Tasks past deadline (red alert) |

### 🛡️ Role-Based Access Control (RBAC)

| Action | Admin 👑 | Member 👤 |
|--------|----------|-----------|
| Create Project | ✅ Yes | ❌ No |
| Delete Project | ✅ Yes | ❌ No |
| Create Task | ✅ Yes | ✅ Yes (limited) |
| View All Tasks | ✅ Yes | ❌ Only assigned tasks |
| Update Any Task | ✅ Yes | ❌ Only own tasks |
| Delete Task | ✅ Yes | ❌ No |
| View All Projects | ✅ Yes | ❌ Only projects with assigned tasks |

### 🗄️ Database & APIs
| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Real Database | ✅ | MongoDB Atlas (NoSQL cloud database) |
| REST APIs | ✅ | Full CRUD endpoints |
| Data Relationships | ✅ | Users → Projects → Tasks |
| Input Validation | ✅ | Email, duplicate, existence checks |
| Error Handling | ✅ | Proper error messages for all operations |

---

## 🛠️ Technology Stack

### Backend
