# 🚌 TransitOps - Smart Transport Operations Platform

TransitOps is an intelligent, unified fleet management and logistics platform designed to streamline transportation operations. By integrating strict Role-Based Access Control (RBAC), robust state machines, and real-time dashboard analytics, TransitOps ensures that the right people have the right tools to keep fleets moving safely and efficiently.

## 🚀 The Problem
Modern transport depots struggle with fragmented systems. Dispatchers dispatch vehicles that are in maintenance, safety officers lack visibility into driver license expiries, and financial analysts are isolated from ground operations. This leads to costly inefficiencies, safety violations, and revenue leaks.

## 💡 Our Solution
TransitOps centralizes the entire depot lifecycle. We built a robust backend powered by State Machines that make it mathematically impossible to dispatch a broken vehicle or assign a driver on leave. We layered this with a strict, fine-grained RBAC matrix so each persona sees exactly what they need to see.

## ✨ Key Features
- **Strict Role-Based Access Control (RBAC):** Fine-grained permissions (View vs Full Access) across 4 distinct roles (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst).
- **Bulletproof State Machines:** Terminal transitions and resource locking. A vehicle in `In Shop` status cannot be assigned to a trip. A trip cannot be dispatched unless the driver is `Available`.
- **Dynamic KPI Dashboard:** Real-time metrics calculating fleet utilization rates, revenue, maintenance costs, and active trips.
- **Automated CSV Export Engine:** Instant stream-based reporting for Trips, Vehicles, and Expenses.
- **RESTful API Architecture:** Fully documented via Swagger with secure JWT authentication.

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, Recharts, Lucide Icons
- **Backend:** Node.js, Express.js, TypeScript
- **Database & ORM:** SQLite, Prisma ORM
- **Security:** bcrypt, JSON Web Tokens (JWT)

---

## 🚦 How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Start the Backend
```bash
cd Backend
npm install
npm run generate    # Generates the Prisma Client
npm run seed        # Seeds the database with test data and users
npm run dev         # Starts the server on http://localhost:3000
```

### 2. Start the Frontend
Open a new terminal window:
```bash
cd Frontend
npm install
npm run dev         # Starts the React app on http://localhost:5173
```

---

## 🔑 Test Credentials & RBAC Matrix
Our database is pre-seeded with test users representing the core organizational roles. Use the password `password123` for all accounts:

| Role | Email | Permissions |
|------|-------|-------------|
| **Fleet Manager** | `manager@transitops.com` | Full access to Vehicles & Dashboards. View access to Maintenance. |
| **Dispatcher** | `dispatcher@transitops.com` | Full access to Trips. View access to Vehicles. |
| **Safety Officer** | `safety@transitops.com` | Full access to Drivers & Maintenance. View access to Trips. |
| **Financial Analyst**| `finance@transitops.com` | Full access to Expenses & Dashboard Analytics. View access to Fleet. |

*Note: Attempting to access unauthorized modules (e.g., a Dispatcher trying to create a vehicle) will result in a strict `403 Forbidden` response from the backend.*

---

