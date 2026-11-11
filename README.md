# DataLens AI

DataLens AI is a portfolio MVP for automated CSV analytics. It parses CSV files, detects column metadata, identifies identifiers, calculates deterministic statistics, builds KPI cards and charts, flags outliers/correlations, generates Gemini-powered executive insights, supports Ask Your Data, and exports PDF/JSON reports.

## Tech Stack

- React 19, TypeScript, Vite, Tailwind CSS
- Express server with TypeScript/tsx
- Gemini via `@google/genai`
- PapaParse, Recharts, jsPDF
- npm as the single package manager

## Architecture

```text
frontend/
  index.html
  src/
    components/      UI and interaction components
    config/          Browser-safe frontend configuration
    data/            Sample CSV datasets
    services/        API, chart aggregation, export services
    utils/           Deterministic CSV/data analysis engines
    types.ts         Frontend domain types
backend/
  src/
    config/          Server environment configuration
    middleware/      Express error middleware
    routes/          API route definitions
    services/        Gemini prompts, AI fallback logic
    types/           Backend request/response types
    server.ts        Express/Vite/static server entrypoint
```

Frontend owns presentation, client state, CSV parsing, deterministic calculations, API calls, charts, and exports. Backend owns HTTP routes, request validation, server-only environment variables, Gemini calls, and server fallbacks. Gemini is not the source of truth for numerical calculations; deterministic dataset calculations remain client-side.

## Environment Variables

Copy `.env.example` to `.env` for local development.

- `GEMINI_API_KEY`: Server-only Gemini API key.
- `PORT`: Express port, defaults to `3000`.
- `NODE_ENV`: Use `production` for production serving.
- `VITE_API_BASE_URL`: Optional frontend API base URL when the frontend is hosted separately.

Never commit real `.env` files or API keys.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The Express server starts on `PORT` and mounts Vite middleware for the frontend.

## Production Build

```bash
npm run build
```

This builds the frontend to `dist/client` and bundles the backend to `dist/server.cjs`.

## Production Start

```bash
NODE_ENV=production npm run start
```

On Windows PowerShell:

```powershell
$env:NODE_ENV='production'; npm run start
```

## Available Scripts

- `npm run dev`: Start Express with Vite middleware.
- `npm run build`: Build frontend and backend.
- `npm run start`: Start the production server bundle.
- `npm run preview`: Preview the Vite frontend build.
- `npm run lint`: Run TypeScript checks.
- `npm run clean`: Remove `dist`.
