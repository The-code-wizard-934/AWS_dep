# Student Management System — Starter

A small full-stack starter with:
- React + Vite frontend
- Flask REST API backend
- PostgreSQL database
- SQLAlchemy ORM

## Requirements
- Node.js 20.19+ or 22.12+
- Python 3.10+
- PostgreSQL 14+ (or Docker Desktop)

## 1. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with:
- Database: `student_db`
- Username: `postgres`
- Password: `postgres`

If you already have PostgreSQL installed, create a database named `student_db` and update `backend/.env` to match your local credentials instead.

## 2. Start the Flask backend

Open a terminal:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

**Windows PowerShell**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows CMD**
```bat
venv\Scripts\activate
```

**macOS/Linux**
```bash
source venv/bin/activate
```

Install dependencies and create the environment file:

```bash
pip install -r requirements.txt
```

Copy `.env.example` to `.env` (Windows PowerShell: `Copy-Item .env.example .env`; macOS/Linux: `cp .env.example .env`).

Start the API:

```bash
python run.py
```

The API runs at `http://127.0.0.1:5000`.

Test it in your browser:
- `http://127.0.0.1:5000/api/health`
- `http://127.0.0.1:5000/api/tasks`

## 3. Start the React frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API and database |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/<id>` | Update title/status |
| DELETE | `/api/tasks/<id>` | Delete a task |

Example POST body:

```json
{
  "title": "Complete React basics",
  "description": "Learn components and state"
}
```

## Important notes
- Tables are created automatically on first backend startup.
- This is a learning starter, not a production-ready system.
- It intentionally has no login yet. Add authentication before storing real or private student data.
- Never commit `.env`, passwords, or secret keys to GitHub.
