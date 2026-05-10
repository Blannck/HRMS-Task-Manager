# HRMS Task & Workload Manager

A complete Minimum Viable Product (MVP) for an HRMS with task management, multi-user assignment, and progress tracking.

## 📋 Features

### Admin Dashboard
- Create tasks with title and description
- Assign tasks to multiple employees simultaneously
- View all tasks with assigned user information
- Track task progress with status indicators
- Manage user accounts

### Employee Dashboard
- View only personally assigned tasks
- Update task status (Pending → In Progress → Completed)
- Access to "My Work" board
- Profile management with avatar upload

### Authentication & Authorization
- Registration and login system
- Token-based API authentication (Laravel Sanctum)
- Role-based access control (Admin/Employee)
- Spatie Laravel Permission integration
- Protected routes with automatic redirection

### Profile Management
- View and edit user information
- Change password
- Profile photo upload with Spatie Media Library
- Avatar display throughout the application

## 🛠️ Technical Implementation

### Backend Architecture

#### Models & Relationships
**User Model:**
- Implements `HasRoles` trait from Spatie Permission
- Implements `HasMedia` interface for photo uploads
- Has many-to-many relationship with Task via `task_user` pivot table
- Includes media collection management for avatars

**Task Model:**
- Has many-to-many relationship with User via `task_user` pivot table
- Status tracking with enum values (pending, in_progress, completed)
- Timestamps for creation and updates

#### API Controllers

**AuthController:**
- Handles user registration with default 'employee' role
- Manages login with token generation
- Provides logout functionality
- Formats user responses consistently

**UserController:**
- Retrieves all employees for assignment dropdowns
- Fetches individual user profiles
- Updates profile information with authorization
- Handles profile photo uploads via Spatie Media Library

**TaskController:**
- Creates tasks with multi-user assignment
- Retrieves all tasks (admin only)
- Fetches user-specific tasks
- Updates task status with proper authorization
- Formats task responses with assigned user information

#### Database Design

**Pivot Table Strategy:**
```php
// task_user pivot table
- id (Primary Key)
- task_id (Foreign Key, cascading delete)
- user_id (Foreign Key, cascading delete)
- unique constraint on (task_id, user_id)
- timestamps
```

**Spatie Permission Tables:**
- `roles` - Role definitions (admin, employee)
- `permissions` - Permission definitions
- `role_has_permissions` - Role-permission mapping
- `model_has_roles` - User-role assignment

### Frontend Architecture

#### State Management
**AuthContext:**
- Centralized authentication state
- Token storage in localStorage
- Automatic token injection in API requests
- Session persistence on page reload
- Role-based redirect logic

#### Routing Strategy
**Protected Routes:**
- Checks authentication status
- Validates user role if required
- Redirects to login if not authenticated
- Redirects to appropriate dashboard based on role

**Route Structure:**
- `/login` - Public login page
- `/register` - Public registration page
- `/profile` - Protected, all roles
- `/admin` - Protected, admin only
- `/create-task` - Protected, admin only
- `/employee` - Protected, employee only

#### Component Architecture

**Pages:**
- **Login.js** - Authentication form with demo credentials display
- **Register.js** - User registration with password confirmation
- **Profile.js** - Profile editing with photo upload capability
- **AdminDashboard.js** - Task overview for admins
- **EmployeeDashboard.js** - Personal task board for employees
- **CreateTask.js** - Task creation with multi-select employee assignment

**Context:**
- **AuthContext.js** - Authentication state and methods

**Components:**
- **ProtectedRoute.js** - Route protection wrapper

#### API Integration
- **api.js** - Configured axios instance with automatic token injection
- Centralized error handling
- Request/response interceptors

### Material-UI Implementation
- Responsive grid layout
- AppBar with user menu
- Card-based task display
- Chips for status indicators
- AvatarGroup for multi-user display
- Form components with validation

## 🔐 Security Features

1. **Role-Based Access Control**
   - Spatie Permission handles all role checks
   - Route middleware on backend
   - Client-side role verification

2. **Authentication**
   - Laravel Sanctum token-based API authentication
   - Tokens stored securely in localStorage
   - Automatic token injection in requests

3. **Authorization**
   - Users can only update their own profile
   - Users can only update status of assigned tasks
   - Employees cannot create tasks
   - API endpoints protected by role middleware

4. **File Upload Security**
   - Spatie Media Library handles file storage
   - Files stored outside public directory
   - Proper MIME type handling

## 📊 Database Relationships

```
Users (1) ──── (Many) Task_User (Many) ──── (1) Tasks
```

**Many-to-Many Relationship:**
- One user can have many tasks
- One task can have many users
- Pivot table stores the relationship
- Cascading deletes for data integrity

## 🚀 Key Features Implemented

✅ **Relational Integrity**
- Correct pivot table implementation
- Proper foreign key constraints
- Cascading deletes for referential integrity

✅ **Spatie Integration**
- Permission-based role system
- Media Library for profile photos
- Trait-based permission checking

✅ **API Communication**
- JSON request/response handling
- Proper HTTP status codes
- Error response formatting
- Token authentication

✅ **State Management**
- Immediate UI updates on action
- Real-time task status changes
- Profile updates reflect instantly
- Context-based global state

✅ **Authentication Flow**
- Registration creates employee by default
- Login redirects based on role
- Protected routes enforce authorization
- Session persistence across reloads

## 📈 Scalability & Extensibility

The project structure allows for easy expansion:

### Future Enhancements
- Task deadlines and reminders
- Task categories/projects
- Team management
- Activity logging
- Real-time notifications
- Advanced reporting
- Performance analytics
- Comment/discussion on tasks
- File attachments to tasks
- Task dependencies

### Extension Points
- Additional permission types in Spatie
- Custom media collections for task attachments
- API versioning for backwards compatibility
- Queue jobs for long-running operations
- Event broadcasting for real-time updates

## 📝 Code Quality

- **Consistent Naming:** Follows Laravel and React conventions
- **Error Handling:** Try-catch blocks with user-friendly messages
- **Type Safety:** Frontend uses consistent data structures
- **Code Organization:** Clear separation of concerns
- **Comments:** Key functions documented

## 🎯 Learning Outcomes

This implementation demonstrates:
1. Many-to-Many database relationships
2. Pivot table usage in Laravel
3. Third-party package integration (Spatie)
4. RESTful API design
5. Token-based authentication
6. React Context API
7. Protected routing patterns
8. File upload handling
9. Role-based access control
10. Frontend-backend integration

## 📦 Dependencies

### Backend (composer.json)
- `laravel/framework: ^10.0`
- `laravel/sanctum: ^3.0`
- `spatie/laravel-permission: ^6.0`
- `spatie/laravel-medialibrary: ^10.0`

### Frontend (package.json)
- `react: ^18.2.0`
- `react-router-dom: ^6.0.0`
- `@mui/material: ^5.14.0`
- `axios: ^1.4.0`

## 📚 Learning Resources

Refer to the SETUP_AND_INSTALLATION.md for:
- Step-by-step setup instructions
- Database schema details
- API endpoint documentation
- Demo credentials
- Troubleshooting guide

---
