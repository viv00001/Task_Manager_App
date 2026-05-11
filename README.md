# 📋 TaskFlow - Team Task Manager

> A complete full-stack team task management application with role-based access control, real database, and REST APIs.

---

## 🌐 Live URL

**https://your-app-name.up.railway.app**

*(Replace with your actual Railway deployment URL after deploying)*

---

## 📝 Project Description

TaskFlow is a **team task management application** that helps teams organize projects, assign tasks, track progress, and meet deadlines. Built as a full-stack application with proper database, REST APIs, and role-based access control.

### What Problem Does It Solve?

Teams struggle to track who is doing what. TaskFlow provides:
- Clear visibility of all tasks and projects
- Proper role separation (Admins manage, Members execute)
- Deadline tracking with overdue alerts
- Real-time status updates

---

## ✅ Features Checklist (All Requirements Met)

### 1. Authentication ✅
- [x] User Signup with name, email, password
- [x] User Login with email and password
- [x] Password hashing using bcrypt (secure)
- [x] Session persistence across page reloads

### 2. Project & Team Management ✅
- [x] Create new projects (Admin only)
- [x] View all projects with descriptions
- [x] Delete projects (Admin only, cascade deletes tasks)
- [x] Team members can view assigned projects

### 3. Task Creation, Assignment & Status Tracking ✅
- [x] Create tasks with title, project, assignee, due date
- [x] Assign tasks to any registered user by email
- [x] Three status levels: Pending → In Progress → Done
- [x] Update task status in real-time
- [x] Due date validation and tracking

### 4. Dashboard (Tasks, Status, Overdue) ✅
- [x] Real-time task statistics (total, pending, progress, done)
- [x] Automatic overdue task detection (red highlight)
- [x] Personal tasks section (shows only assigned tasks)
- [x] Complete tasks table for team-wide view

### 5. REST APIs + Database ✅
- [x] Full RESTful API endpoints
- [x] MongoDB Atlas (NoSQL cloud database)
- [x] Proper data relationships (Users → Projects → Tasks)
- [x] Indexed fields for fast queries

### 6. Validations & Relationships ✅
- [x] Email format validation
- [x] Duplicate email check during signup
- [x] Project existence validation before task creation
- [x] User existence validation before task assignment
- [x] One-to-many relationships between Users/Tasks and Projects/Tasks

### 7. Role-Based Access Control (RBAC) ✅
| Action | Admin 👑 | Member 👤 |
|--------|----------|-----------|
| Create Project | ✅ Yes | ❌ No |
| Delete Project | ✅ Yes | ❌ No |
| Create Task | ✅ Yes | ✅ Yes |
| View All Tasks | ✅ Yes | ❌ Only assigned |
| Update Any Task | ✅ Yes | ❌ Only own |
| Delete Task | ✅ Yes | ❌ No |

### 8. Deployment ✅
- [x] Deployed on Railway
- [x] HTTPS enabled
- [x] Environment variables configured
- [x] Live URL accessible

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB Atlas | Cloud NoSQL database |
| bcryptjs | Password hashing |
| dotenv | Environment variables |

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| CSS3 | Styling with gradients & animations |
| Vanilla JavaScript | Logic & API calls |
| Fetch API | AJAX requests |

### Deployment
| Platform | Purpose |
|----------|---------|
| Railway | Cloud hosting (free tier) |
| GitHub | Version control |

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  role: "admin" | "member",
  createdAt: Date
}
