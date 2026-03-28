# Fabric Management System - Hiran Fabric Textile

A comprehensive inventory and sales management system for fabric retailers, featuring a React frontend, Node/Express backend, and PostgreSQL database.

## 🚀 Getting Started

Follow these steps to set up the development environment on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the database)
- npm (comes with Node.js)

---

### Step 1: Database Setup
The project uses PostgreSQL managed via Docker Compose.

1.  Open a terminal in the project root.
2.  Run the following command to start the database:
    ```bash
    docker compose up -d
    ```

---

### Step 2: Backend Configuration
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    - Copy `.env.example` to a new file named `.env`.
    - Fill in the required values (Database, JWT secrets, etc.).
4.  Start the Backend:
    ```bash
    npm run dev
    ```
    > [!NOTE]
    > On the first run, the system will automatically create all database tables and seed a default administrator account.

---

### Step 3: Frontend Configuration
1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Frontend:
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:5173`.

---

## 🔐 Default Admin Credentials
Once the backend starts for the first time, you can log in with:

- **Email**: `admin@system.com`
- **Password**: `Admin@123`

---

## 📂 Project Structure
- **/backend**: Express API, PostgreSQL models (Singleton), and server logic.
- **/frontend**: React application with Vite, Tailwind (optional), and Lucide icons.
- **/backend/src/models**: Individual model files for every database table.
- **/backend/uploads**: Storage for fabric images and payment slips.

## 🛠️ Key Commands
- `docker compose stop`: Stop the database.
- `node scripts/reset_admin.js`: Manually reset or create the admin account (run from `/backend`).
