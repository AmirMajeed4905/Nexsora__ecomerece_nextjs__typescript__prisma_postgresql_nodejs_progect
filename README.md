# Nexora — Full Stack E-Commerce Platform

A modern, production-ready e-commerce platform built with Next.js, Node.js, TypeScript, PostgreSQL, and Prisma.

## Tech Stack

**Frontend**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (State Management)

**Backend**
- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication (Access + Refresh Tokens)
- Zod Validation
- Swagger API Docs

**DevOps**
- Docker
- GitHub Actions CI/CD
- AWS EC2

## Docker Setup

This repository now includes production-ready Dockerfiles for both backend and frontend, plus a root `docker-compose.yml` for local development.

1. Copy the environment template:
```bash
cp .env.example .env
```
2. Start the full stack:
```bash
docker compose up --build
```
3. Open:
- Frontend: `http://localhost:3000`
- Backend API docs: `http://localhost:5000/api/docs`

## GitHub Actions CI/CD

A GitHub Actions workflow is configured at `.github/workflows/ci.yml`.
The CI pipeline performs:
- backend dependency install, Prisma generation, and build
- frontend dependency install, lint, and build
- Docker image build validation for both services

## Features

- JWT Auth with HttpOnly cookies & refresh token rotation
- Role-based access control (Admin / Customer)
- Products & Categories management
- Shopping Cart
- Orders with Stripe payments
- Product Reviews & Wishlist
- Swagger API documentation

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm

### Installation
```bash
# Clone the repo
git clone https://github.com/AmirMajeed4905/Nexsora__ecomerece_nextjs__typescript__prisma_postgresql_nodejs_progect.git

# Install dependencies
cd backend
npm install

# Setup environment variables
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Local Docker Development
```bash
cp .env.example .env
docker compose up --build
```

The backend runs on `http://localhost:5000` and the frontend runs on `http://localhost:3000`.

## API Documentation

Run the server and visit:
```
http://localhost:5000/api/docs
```

## Project Status

- [x] Authentication (Register, Login, Logout, Refresh Token)
- [x] Products CRUD
- [x] Categories CRUD
- [x] Cart
- [x] Orders
- [X] Stripe Payments
- [x] Frontend (Next.js)
- [X] Admin Panel
- [ ] Deployment
