# Fabric Management System - Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. PostgreSQL Database Setup

Make sure you have PostgreSQL running and configured in your `.env` file. Then run the automatic setup script:

```bash
cd backend
npm run setup-db
```

This will create all necessary tables and seed the initial accounts.

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@system.com` | `123456` |
| **Customer** | `customer@test.com` | `123456` |


### 3. Start Server
```bash
npm start
```

### 4. Test API
- Backend: http://localhost:5000/
- Register: POST http://localhost:5000/register
- Login: POST http://localhost:5000/login
- Users: GET http://localhost:5000/users

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Test backend |
| POST | `/login` | Login user |
| POST | `/logout` | Logout user |
| POST | `/register` | Register customer |
| GET | `/auth/me` | Get current user info |

## Environment

- Node.js + Express
- PostgreSQL Database
- bcryptjs for password hashing
- Session-based authentication with `connect-pg-simple`
- CORS enabled for frontend access