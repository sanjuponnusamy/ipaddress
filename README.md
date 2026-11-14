<<<<<<< HEAD
# Network Device Inventory Management System with IPv4 Address Validation

A comprehensive full-stack Computer Networks college project built with **React (Vite)**, **Tailwind CSS**, **Node.js/Express**, and **MongoDB Atlas**.

## Project Architecture

```
network-device-inventory/
├── frontend/                     # React + Vite + Tailwind CSS + Recharts
│   ├── src/
│   │   ├── components/           # Reusable UI widgets, navigation, dialogs
│   │   ├── pages/                # Dashboard, Inventory, IPv4 Validator, Logs, etc.
│   │   ├── services/             # Axios API clients for backend communication
│   │   ├── hooks/                # Connection heartbeats, theme, polling hooks
│   │   ├── assets/               # Static assets & icons
│   │   ├── App.jsx               # Application root layout & routing
│   │   ├── main.jsx              # Vite React entry point
│   │   └── index.css             # Tailwind base styles & custom dark theme
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/                      # Node.js + Express + Mongoose
│   ├── config/                   # MongoDB database connection configuration
│   ├── controllers/              # Business logic & request handlers
│   ├── models/                   # Mongoose schemas (devices, activitylogs, monitoringlogs)
│   ├── routes/                   # Express REST API routes
│   ├── middleware/               # Error handling, validation middleware
│   ├── services/                 # IPv4 validation, network ping/check utilities
│   ├── server.js                 # Express server bootstrap & health check
│   ├── package.json
│   └── .env.example
│
├── .gitignore                    # Root gitignore
└── README.md                     # Documentation & setup guide
```

## Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```
=======
# ipaddress
>>>>>>> 5408a56e155ec28963d69ccfed4738f0ee8a3f75
