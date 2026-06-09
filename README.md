# WealthIQ
Global financial intelligence platform designed to estimate and forecast investment growth across multiple countries.

## Services

| Service | Stack | Port |
|---------|-------|------|
| `wealthiq-ui` | React + Vite (SPA) | 3000 |
| `wealthiq-api` | Python + FastAPI | 8000 |

## Quick Start

### API (Python)
```bash
cd wealthiq-api
pip install -r requirements.txt
uvicorn main:app --reload
# Swagger UI → http://localhost:8000/docs
```

### UI (React)
```bash
cd wealthiq-ui
npm install
npm run dev
# App → http://localhost:3000
```

The Vite dev server proxies `/api/*` → `http://localhost:8000` so no CORS issues during development.

## Project Structure
```
WealthIQ/
├── wealthiq-ui/          # React SPA
│   ├── src/
│   │   ├── components/   # StatCard, GoalProgress, GrowthChart, Navbar
│   │   ├── pages/        # Dashboard, Portfolio, Goals
│   │   ├── hooks/        # usePortfolio, useGoals
│   │   └── services/     # api.js (fetch wrapper)
│   └── vite.config.js
│
└── wealthiq-api/         # FastAPI service
    ├── main.py
    ├── app/
    │   ├── routers/      # portfolio.py, goals.py
    │   ├── models/       # schemas.py (Pydantic)
    │   └── data/         # mock_data.py
    └── requirements.txt
```
