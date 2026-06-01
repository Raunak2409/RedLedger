# 🔴 RedLedger

A premium, highly interactive full-stack Inventory & Order Management System with dynamic theming. Built with a responsive React frontend, a high-performance Python FastAPI backend, and PostgreSQL/SQLite database support, fully containerized using Docker and Compose.

The frontend is specifically tailored around a sophisticated **dark and light red design system**, boasting glassmorphism details, vibrant theme switching, custom theme-aware SVG iconography, and responsive UX layouts.

---

## ✨ Features

- **🔴 RedLedger Design System**: Harmony-driven UI utilizing curated blood red (`#8A0303`) accents, soft reds, and modern dark-slate gradients.
- **🌓 Dynamic Theme Engine**: Smooth dark and light mode toggle. All tables, cards, modal overlays, inputs, scrollbars, and `code` containers automatically adapt.
- **⚡ Fully Interactive Dashboards**: Real-time summaries (Total Products, Total Customers, Total Orders) with a custom warning table for low-stock products.
- **📋 Product & Customer Management**: Responsive split-layout panels for creation, inline editing, and deletion with robust client/server validation.
- **🛍️ Order Processing & Detailed Modals**: Advanced modal display for orders showing client info and detailed interactive line-item product breakdowns.
- **🎨 Premium Visual Polish**: High-fidelity theme-aware custom SVGs, custom scrollbars, animated button hovers, responsive layouts for tablets and mobile devices.
- **🐳 Containerized Dev Environment**: Fully pre-configured Docker Compose workspace.

---

## 📁 Project Structure

```
RedLedger/
├── docker-compose.yml
├── README.md
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   ├── .dockerignore
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models/
│       ├── schemas/
│       └── routes/
└── frontend/
    ├── Dockerfile
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── .dockerignore
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/
        └── pages/
```

---

## 🚀 Running the Application Locally

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine installed.
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop).

### Setup and Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Raunak2409/RedLedger.git
   cd RedLedger
   ```

2. **Launch all services**:
   Run the following command in the root workspace folder to build and launch all containers (Database, Backend, and Frontend):
   ```bash
   docker compose up --build -d
   ```

3. **Access the Application**:
   - 💻 **Frontend React UI**: [http://localhost](http://localhost) (mapped to port `80`)
   - 🔌 **Backend API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Database Migrations & Seed Data

On initial startup, the backend automatically performs migrations and populates the SQLite/PostgreSQL database with clean demo entries to instantly showcase the dashboard's features.

### Teardown

- **Stop containers and keep volumes intact**:
  ```bash
  docker compose down
  ```
- **Stop containers and purge all database volume data**:
  ```bash
  docker compose down -v
  ```

---

## 🛠️ Stack & Technologies

### Frontend
- **Framework**: React (Vite-powered for rapid development & Hot Module Replacement)
- **Styling**: Vanilla CSS3 custom-tailored design system using CSS Variables
- **Icons**: Responsive inline SVGs
- **HTTP Client**: Axios with configured services

### Backend
- **Framework**: FastAPI (Asynchronous Python backend)
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL (Docker environment) / SQLite (Fallback support)

---

## 🔒 Environment Configurations

- **Backend Env**: Customizable via `backend/.env` (handles custom DB URLs and host parameters).
- **Frontend API Config**: Auto-configures to proxy backend calls in Dev mode, and directly references production endpoints on static builds.

---

## 🌟 Visual Preview

Features custom micro-animations, glassmorphic dark-mode backgrounds, blood-red cards, border highlights, and fully responsive layouts. Experience the application locally or view the deployed versions.
