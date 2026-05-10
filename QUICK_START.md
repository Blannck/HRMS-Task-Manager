# Quick Start Guide

## 5-Minute Setup

### Prerequisites
- PHP 8.1+
- MySQL 5.7+
- Node.js 16+
- Composer installed

### Step 1: Backend Setup (2 minutes)

```bash
cd backend

# Install dependencies
composer install

# Copy environment file on a fresh clone
cp .env.example .env

# If backend/.env already exists, skip the copy and edit that file directly

# Generate app key (UPDATE APP_KEY in .env)
php artisan key:generate

# Create database
mysql -u root -p -e "CREATE DATABASE hrms_db;"

# Update .env database credentials if needed

# Run migrations and seeds
php artisan migrate
php artisan db:seed --class=RoleAndPermissionSeeder

# Create storage symlink for file uploads
php artisan storage:link

# Start server
php artisan serve
```

Backend will run at: **http://localhost:8000**

### Step 2: Frontend Setup (3 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will open at: **http://localhost:3000**

---

## Demo Accounts

### Login as Admin
- Email: `admin@example.com`
- Password: `password123`

### Login as Employee
- Email: `john@example.com`
- Password: `password123`

---

## What You Can Do

### As Admin
1. Click "Create Task" button
2. Fill in task details
3. Select employees to assign
4. View all tasks in the dashboard

### As Employee
1. View your assigned tasks
2. Click "Start" to begin a task
3. Click "Complete" to finish a task
4. View your profile and upload a photo

---

## Common Issues

### Database Connection Error
```bash
# Make sure MySQL is running
# Update DB credentials in .env
DB_DATABASE=hrms_db
DB_USERNAME=root
DB_PASSWORD=
```

### CORS/Connection Error in Console
```bash
# Ensure Laravel backend is running on port 8000
# Check if the port is in use: netstat -ano | findstr :8000
```

### Storage Link Error
```bash
# Recreate storage link
php artisan storage:link
```

### Port Already in Use
```bash
# React (3000)
npm start -- --port 3001

# Laravel (8000)
php artisan serve --port=8001
```

---

## Project Structure Overview

```
📁 backend/
├── 📁 app/
│  ├── 📁 Models/        ← Database models
│  │  ├── User.php
│  │  └── Task.php
│  └── 📁 Http/
│     └── 📁 Controllers/ ← API logic
│        ├── AuthController.php
│        ├── UserController.php
│        └── TaskController.php
├── 📁 database/
│  ├── 📁 migrations/     ← Database schema
│  └── 📁 seeders/        ← Sample data
├── 📁 routes/
│  └── api.php            ← API routes
└── .env                  ← Configuration

📁 frontend/
├── 📁 src/
│  ├── 📁 context/        ← Global state (Auth)
│  ├── 📁 components/     ← Reusable components
│  ├── 📁 pages/          ← Page components
│  │  ├── Login.js
│  │  ├── Register.js
│  │  ├── Profile.js
│  │  ├── AdminDashboard.js
│  │  ├── EmployeeDashboard.js
│  │  └── CreateTask.js
│  ├── api.js             ← API configuration
│  ├── App.js             ← Main component with routing
│  └── index.js
└── package.json
```

---

## Key Files to Understand

### Database Models
- **[backend/app/Models/User.php](backend/app/Models/User.php)** - User with roles and media
- **[backend/app/Models/Task.php](backend/app/Models/Task.php)** - Task with many-to-many users

### API Controllers
- **[backend/app/Http/Controllers/AuthController.php](backend/app/Http/Controllers/AuthController.php)** - Registration, login, logout
- **[backend/app/Http/Controllers/TaskController.php](backend/app/Http/Controllers/TaskController.php)** - Task CRUD and status
- **[backend/app/Http/Controllers/UserController.php](backend/app/Http/Controllers/UserController.php)** - Profile management

### Frontend Pages
- **[frontend/src/pages/Login.js](frontend/src/pages/Login.js)** - Authentication page
- **[frontend/src/pages/AdminDashboard.js](frontend/src/pages/AdminDashboard.js)** - Admin task view
- **[frontend/src/pages/EmployeeDashboard.js](frontend/src/pages/EmployeeDashboard.js)** - Employee work board
- **[frontend/src/pages/CreateTask.js](frontend/src/pages/CreateTask.js)** - Task creation form

---

## Next Steps

1. **Explore the code:**
   - Understand the database relationships
   - Review the API endpoints
   - Check the frontend components

2. **Modify demo data:**
   - Edit `RoleAndPermissionSeeder.php` to add more users
   - Customize task statuses
   - Add new roles/permissions

3. **Add features:**
   - Task deadlines
   - Task categories
   - User teams
   - Email notifications
   - File attachments

4. **Deploy:**
   - Set up production database
   - Configure API endpoint for production
   - Build React app for production: `npm run build`

---

## Documentation Files

- **[README.md](README.md)** - Project overview and features
- **[SETUP_AND_INSTALLATION.md](SETUP_AND_INSTALLATION.md)** - Detailed setup guide
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - All API endpoints
- **[IMPLEMENTATION_DETAILS.md](IMPLEMENTATION_DETAILS.md)** - Architecture and patterns

---

## Getting Help

### Errors While Running

**Backend errors:**
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Verify migrations ran
php artisan migrate:status
```

**Frontend errors:**
```bash
# Check browser console
Press F12 to open DevTools

# Check network requests
Go to Network tab to see API calls
```

### Connection Issues

1. Verify MySQL is running: `mysql -u root`
2. Check Laravel server: `http://localhost:8000/health`
3. Check React app: `http://localhost:3000`

---

**Ready to explore? Start by logging in with the demo credentials!** 🚀
