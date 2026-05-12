# HRMS Task & Workload Manager - Setup & Installation Guide

## Project Overview

This guide is split into two parts:
- First-time setup: run once on a fresh machine or fresh clone
- Daily run: the short commands you use after the project is already installed

This is a comprehensive HRMS (Human Resource Management System) with task management capabilities. It features:
- Admin users who can create tasks and assign them to employees
- Employees who can view assigned tasks and update their status
- Profile management with photo uploads
- Role-based access control using Spatie
- Many-to-Many task-user relationships

## Technology Stack

**Backend:**
- Laravel 10
- MySQL
- Spatie Laravel Permission (role/permission management)
- Spatie Media Library (file uploads)
- Laravel Sanctum (API authentication)

**Frontend:**
- React 18
- Material-UI (MUI)
- React Router v6
- Axios

## Prerequisites

- PHP 8.1 or higher
- Composer
- MySQL 5.7 or higher (or MariaDB)
- Node.js 16+ and npm
- Git (optional)

## First-Time Setup (Run Once After Cloning)

### Step 1: Start MySQL Server

**Windows:**
```powershell
cd "D:\Codes\Team Task & Workload Manager\backend"
& 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe' --defaults-file='.\\my-local.ini' --console
```

**Mac:**
```zsh
cd backend
/usr/local/mysql/bin/mysqld --defaults-file='./my-mac.ini' --console
```

Keep this terminal open. You should see: `ready for connections ... port: 3306`

### Step 2: Backend Setup (New Terminal)

**Windows:**
```powershell
cd "D:\Codes\Team Task & Workload Manager\backend"
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed --class=RoleAndPermissionSeeder
php artisan storage:link
php artisan route:clear
php artisan config:clear
php artisan serve
```

**Mac:**
```zsh
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed --class=RoleAndPermissionSeeder
php artisan storage:link
php artisan route:clear
php artisan config:clear
php artisan serve
```

Wait for: `INFO  Server running on [http://127.0.0.1:8000]`

### Step 3: Frontend Setup (Another New Terminal)

**Windows:**
```powershell
cd "D:\Codes\Team Task & Workload Manager\frontend"
npm install
npm start
```

**Mac:**
```zsh
cd frontend
npm install
npm start
```

The frontend will automatically open at `http://localhost:3000`.

**Setup is complete!**

## Daily Run (Every Time You Start Developing)

### Terminal 1: Start MySQL

**Windows:**
```powershell
cd "D:\Codes\Team Task & Workload Manager\backend"
& 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe' --defaults-file='.\\my-local.ini' --console
```

**Mac:**
```zsh
cd backend
/usr/local/mysql/bin/mysqld --defaults-file='./my-mac.ini' --console
```

Keep this open. If you get "Unable to lock ./ibdata1 error: 35", run `killall mysqld` and try again.

For Windows: If you want MySQL to start automatically every time, create the Windows service once in an Administrator PowerShell and then use this terminal command on future runs:

```powershell
Start-Service -Name HRMS_MySQL
```

### Terminal 2: Start Laravel Backend

**Windows:**
```powershell
cd "D:\Codes\Team Task & Workload Manager\backend"
php artisan config:clear
php artisan route:clear
php artisan serve
```

**Mac:**
```zsh
cd backend
php artisan config:clear
php artisan route:clear
php artisan serve
```

Wait for: `INFO  Server running on [http://127.0.0.1:8000]`

### Terminal 3: Start React Frontend

**Windows:**
```powershell
cd "D:\Codes\Team Task & Workload Manager\frontend"
npm start
```

**Mac:**
```zsh
cd frontend
npm start
```

The frontend will automatically open at `http://localhost:3000`.

**You're ready to develop!**

## Quick Troubleshooting

- **Backend won't start?** Make sure MySQL is running (Terminal 1).
- **"No application encryption key has been specified"?** Run `cp .env.example .env` then `php artisan key:generate` in the backend directory.
- **MySQL error: "Unable to lock ./ibdata1 error: 35" (Mac)?** Run `killall mysqld` to stop all MySQL processes, then try starting MySQL again.
- **Login route returns 404?** Make sure `backend/bootstrap/app.php` loads `routes/api.php` and then run `php artisan route:clear` before restarting the backend.
- **Login fails?** Clear your browser's localStorage (DevTools → Application → localStorage → Clear all).
- **Port 3000/8000 already in use?** Kill the process or change the port.
- **Node modules/vendor outdated?** Delete `node_modules` / `vendor` and re-run `npm install` / `composer install`.

## Demo Credentials

### Admin User
- **Email:** admin@example.com
- **Password:** password123

### Employee Users
- **John Doe:** john@example.com / password123
- **Jane Smith:** jane@example.com / password123
- **Bob Johnson:** bob@example.com / password123

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login and get auth token
- `POST /api/logout` - Logout (requires auth)

### User Management
- `GET /api/users` - Get all employees
- `GET /api/profile/{id}` - Get user profile
- `PATCH /api/profile/{id}` - Update profile and upload photo

### Task Management
- `POST /api/tasks` - Create a task (admin only)
- `GET /api/tasks` - Get all tasks (admin only)
- `GET /api/my-tasks/{userId}` - Get user's assigned tasks
- `PATCH /api/tasks/{id}/status` - Update task status

## Database Schema

### Users Table
```sql
- id (Primary Key)
- name
- email (Unique)
- password
- email_verified_at
- remember_token
- created_at
- updated_at
```

### Tasks Table
```sql
- id (Primary Key)
- title
- description
- status (enum: pending, in_progress, completed)
- created_at
- updated_at
```

### Task_User Pivot Table
```sql
- id (Primary Key)
- task_id (Foreign Key -> tasks.id)
- user_id (Foreign Key -> users.id)
- timestamps
- unique constraint on (task_id, user_id)
```

### Media Table (Spatie Media Library)
```sql
- id
- model_type
- model_id
- collection_name (e.g., 'avatar')
- name
- file_name
- mime_type
- disk
- size
- And other metadata columns
```

## Key Features

### Admin Features
- ✅ Create tasks with title and description
- ✅ Assign tasks to multiple employees
- ✅ View all tasks and their assigned users
- ✅ Manage user accounts
- ✅ View dashboard with all tasks

### Employee Features
- ✅ View only assigned tasks
- ✅ Update task status (pending → in_progress → completed)
- ✅ View profile information
- ✅ Upload/update profile photo
- ✅ Change password

### Common Features
- ✅ User authentication with token-based API
- ✅ Profile management
- ✅ Photo uploads with media library
- ✅ Role-based access control
- ✅ Responsive Material-UI design

## Project Structure

```
Team Task & Workload Manager/
├── backend/
│   ├── app/
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   └── Task.php
│   │   └── Http/
│   │       └── Controllers/
│   │           ├── AuthController.php
│   │           ├── UserController.php
│   │           └── TaskController.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │       └── RoleAndPermissionSeeder.php
│   ├── routes/
│   │   └── api.php
│   ├── config/
│   │   ├── auth.php
│   │   └── medialibrary.php
│   ├── .env.example
│   └── composer.json
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── components/
    │   │   └── ProtectedRoute.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Profile.js
    │   │   ├── AdminDashboard.js
    │   │   ├── EmployeeDashboard.js
    │   │   └── CreateTask.js
    │   ├── api.js
    │   ├── App.js
    │   └── index.js
    ├── public/
    │   └── index.html
    └── package.json
```

## Troubleshooting

### "Could not open socket" or Database Connection Error
- Ensure MySQL is running
- Check database credentials in `.env`
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### CORS Errors in Browser Console
- Ensure Laravel server is running on port 8000
- Check `SANCTUM_STATEFUL_DOMAINS` in `.env`

### "File not found" for uploaded photos
- Verify storage link exists: `php artisan storage:link`
- Check storage permissions: `chmod -R 775 storage bootstrap/cache`

### Authentication issues
- Clear browser localStorage
- Verify API endpoint in `src/api.js` matches your backend URL
- Check auth token in localStorage (DevTools > Application)

## Next Steps for Production

1. **Generate App Key:** `php artisan key:generate`
2. **Set up environment variables** for production URLs
3. **Use HTTPS** for all API communications
4. **Configure CORS properly** for your domain
5. **Set up database backups**
6. **Configure email notifications**
7. **Implement rate limiting**
8. **Add request logging and monitoring**

## Support

For issues or questions, refer to:
- Laravel Documentation: https://laravel.com/docs
- React Documentation: https://react.dev
- Spatie Permission: https://spatie.be/docs/laravel-permission
- Spatie Media Library: https://spatie.be/docs/laravel-medialibrary
