# Full Stack Portfolio System

A production-oriented portfolio platform with secure authentication, admin dashboard, and contact handling.

# Introduction

I am a backend developer and an aspiring full stack developer. I built this project for my portfolio website. I used AI tools for frontend design and review. This projects showcases my ability to create and deploy a full stack project from scratch. I will be working on more such projects in future.

## Features

- JWT-based authentication (login & signup)
- Role-based access control (admin-only routes)
- Protected admin dashboard
- Contact form with rate limiting
- Async email notifications
- PostgreSQL database with Alembic migrations
- Redis-based request throttling

## Tech Stack

- Backend: FastAPI
- Frontend: React (Vite)
- Database: PostgreSQL
- Cache: Redis
- Auth: JWT
- Migrations: Alembic

## API Overview

- `POST /api/auth/login` — authenticate user
- `POST /api/auth/signup` — register user
- `POST /api/contact` — submit message
- `GET /api/admin/contact` — admin-only access
- `GET /api/admin/contact/count` — admin-only analytics

## Security

- Password hashing using bcrypt
- JWT-based authentication
- Role-based authorization
- Rate limiting on login and contact endpoints
- Input validation via Pydantic schemas

## Setup

```bash
git clone <repo-url>
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload