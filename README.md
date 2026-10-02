# OpsFlow

A lightweight operations and work-item management application built as a full-stack Next.js technical portfolio project.

## Overview

Teams need a straightforward way to assign work and track progress. OpsFlow provides a focused example of that workflow while keeping authentication, authorization, validation, and data access easy to inspect.

## Features

- Credentials login with two seeded demo accounts
- Role-aware dashboard and searchable Work Item list
- Admin creation, editing, assignment, status changes, and deletion
- Member access to assigned items and their status only

## Tech Stack

Next.js App Router, React, TypeScript, Tailwind CSS, Auth.js, Zod, Prisma, and local SQLite.

## Architecture

Pages use Server Components for authenticated data reads. Small Client Components handle form and status interactions. Work Item mutations use Route Handlers that validate requests, check the current user, and call focused service functions. Prisma queries stay in the service layer. Auth.js uses Credentials authentication and JWT sessions; authorization checks the current database user on every protected request.

## Authorization Model

An **ADMIN** can view and manage every Work Item. A **MEMBER** can view only assigned Work Items and change only their status. The status endpoint accepts no other editable fields. Page access and API mutations enforce these rules on the server.

## Project Structure

- `app/` — pages, layouts, and Work Item API routes
- `components/` — shared layout and UI elements
- `features/auth/` — login form and validation
- `features/work-items/` — Work Item schemas, services, and UI
- `lib/` — authorization, database connection, and API error handling
- `prisma/` — schema, migration, and demo seed
- `scripts/` — local setup and end-to-end checks

## Getting Started

Use Node.js 22.18 or newer and npm. No external database or API key is required.

```bash
npm install
npm run db:setup
npm run dev
```

Open `http://localhost:3000`. The setup command creates a local Auth.js secret if needed, applies the SQLite migration, generates Prisma Client, and seeds the demo data. The secret and SQLite database are ignored by Git. Re-running setup does not duplicate demo records.

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@opsflow.dev` | `demo123` |
| Member | `member@opsflow.dev` | `demo123` |

These credentials are for local demonstration only. Passwords are stored as bcrypt hashes in the database.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run db:setup` | Apply migrations and seed the local database |
| `npm run db:migrate` | Create or apply development migrations |
| `npm run db:seed` | Upsert demo users and Work Items |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run typecheck` | Check TypeScript |
| `npm run lint` | Run ESLint |
| `npm run build` | Build the production app |
| `npm run start` | Serve a production build |
| `npm run verify:auth` | Check both demo logins |
| `npm run verify:stage2` | Check dashboard visibility and list filters |
| `npm run verify:stage3` | Check Work Item mutations and permissions |

## Testing

Run `npm run db:setup`, then keep `npm run dev` running in one terminal. In another terminal, run `npm run verify:auth`, `npm run verify:stage2`, and `npm run verify:stage3`. The Stage 3 check creates and removes its own test Work Item. Run `npm run typecheck`, `npm run lint`, and `npm run build` for static and production-build checks.

## Design Decisions

- SQLite makes the local review flow self-contained.
- Server-side authorization protects data even when a request bypasses the UI.
- A dedicated status mutation contract prevents Members from changing protected fields.
- URL-based filters keep list views shareable without client-side data fetching.
- The feature set stays small so the main architecture remains easy to review.

## Future Improvements

For a larger deployment, pagination and a persistent activity history would be useful additions.
