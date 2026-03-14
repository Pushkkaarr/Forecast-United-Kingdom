# Forecast - United Kingdom Wind Power

Analysis and forecasting of UK wind power generation.

## Structure

- `forecast-app/` - Main monorepo
  - `apps/web/` - Next.js dashboard and API routes
  - `packages/ui/` - Shared UI components
  - `packages/eslint-config/` - Config files
- `wind_analysis.ipynb` - Jupyter notebook for error analysis

## Getting Started

### Prerequisites
- Node.js >= 20
- npm 10.9.2

### Install & Run

```bash
cd forecast-app
npm install
npm run dev
```

The app will start on `http://localhost:3000`


## Live App

https://forecast-united-kingdom.vercel.app/

## API Endpoints

- `/api/actuals` - Historical wind generation data
- `/api/forecasts` - Wind power forecasts
- `/api/debug` - Debug information
