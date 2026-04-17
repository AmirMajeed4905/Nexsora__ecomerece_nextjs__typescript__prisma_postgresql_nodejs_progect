# Nexora — Full-Stack E-Commerce Platform

<div align="center">

![Nexora](https://img.shields.io/badge/Nexora-E--Commerce-rose?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-336791?style=for-the-badge&logo=postgresql)

**A production-ready, full-stack e-commerce platform built with modern technologies.**

[Live Demo](https://nexora-client.vercel.app) · [API Docs](https://nexora-api.onrender.com/api/docs) · [Report Bug](https://github.com/AmirMajeed4905/Nexsora__ecomerece_nextjs__typescript__prisma_postgresql_nodejs_progect/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

---

## Overview

Nexora is a fully featured e-commerce application built from scratch using a modern full-stack approach. It includes a customer-facing storefront, an admin dashboard, and a RESTful API with JWT authentication, Stripe payments, Cloudinary image management, and more.

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | React framework with App Router |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| Zustand | 5 | State management |
| Axios | 1.x | HTTP client with interceptors |
| Stripe.js | latest | Payment UI |
| Sonner | 2.x | Toast notifications |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 4.x | REST API framework |
| TypeScript | 5 | Type safety |
| Prisma | 6 | ORM & database client |
| PostgreSQL | 15+ | Primary database (Neon cloud) |
| JWT | 9.x | Authentication tokens |
| Bcrypt | 6.x | Password hashing |
| Zod | 4.x | Request validation |
| Cloudinary | 2.x | Image storage & optimization |
| Stripe | latest | Payment processing |
| Multer | 1.x | File upload handling |
| Swagger | 3.x | API documentation |

---

## Features

### Customer Features
- **Authentication** — Register, Login, Logout, JWT refresh tokens, HttpOnly cookies
- **Product Browsing** — Search, filter by category, price range, sort, cursor pagination
- **Product Detail** — Image gallery, reviews & ratings, related products
- **Cart** — Add/remove/update items, optimistic UI updates
- **Checkout** — Cash on Delivery or Card payment via Stripe
- **Orders** — Place, track, and cancel orders
- **Wishlist** — Save products for later
- **Reviews** — Submit ratings and reviews (verified purchase only)
- **Profile** — Update avatar, view account info, delete account

### Admin Features
- **Dashboard** — Revenue, orders, users, low stock alerts
- **Products** — Full CRUD with multi-image Cloudinary upload
- **Categories** — Full CRUD with image upload
- **Orders** — View all orders, update status

### Technical Features
- JWT access tokens (15 min) + HttpOnly refresh tokens (7 days)
- Optimistic UI updates for instant feedback
- Cursor-based pagination for scalable product listing
- Global error handler (Prisma, JWT, Multer errors)
- Rate limiting on auth and upload routes
- Role-based access control (CUSTOMER / ADMIN)
- Automatic avg rating recalculation on review submit
- Stock management with transaction safety

---

## Project Structure

```
nexora/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── config/          # env, prisma, cloudinary, swagger
│       ├── middlewares/     # auth, role, upload, error, rateLimit
│       ├── modules/
│       │   ├── auth/        # register, login, logout, refresh, me
│       │   ├── product/     # CRUD + search + trending
│       │   ├── category/    # CRUD + image upload
│       │   ├── cart/        # add, update, remove, clear
│       │   ├── order/       # create, list, cancel, admin status
│       │   ├── review/      # create, list, delete + avg rating
│       │   ├── wishlist/    # toggle, list, check
│       │   ├── payment/     # Stripe intent, webhook, COD
│       │   └── admin/       # dashboard stats
│       ├── utils/           # asyncHandler, response, jwt, cloudinary
│       └── validations/     # Zod schemas
│
└── frontend/
    ├── app/
    │   ├── (auth)/          # login, register (no navbar)
    │   ├── (store)/         # homepage, products, cart, orders, wishlist, account
    │   └── admin/           # dashboard, products, categories, orders
    ├── components/
    │   ├── home/            # HeroCarousel, CategoriesGrid, TrendingProducts, FeaturedBanner
    │   ├── product/         # ProductCard, ReviewSection
    │   ├── checkout/        # CheckoutModal (Stripe + COD)
    │   ├── ui/              # StarRating, WishlistButton, AddToCartButton
    │   └── shared/          # Navbar, Footer, AuthProvider
    ├── store/               # authStore, cartStore, wishlistStore (Zustand)
    └── lib/                 # axios instance with interceptors
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)
- Cloudinary account
- Stripe account

### 1. Clone the repository

```bash
git clone https://github.com/AmirMajeed4905/Nexsora__ecomerece_nextjs__typescript__prisma_postgresql_nodejs_progect.git
cd nexora
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (see [Environment Variables](#environment-variables))

```bash
npx prisma migrate dev
npm run dev
```

Backend runs at `http://localhost:5000`
API docs at `http://localhost:5000/api/docs`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## Environment Variables

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# JWT
ACCESS_TOKEN_SECRET=your_access_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Client
CLIENT_URL=http://localhost:3000
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## API Documentation

Full Swagger docs available at `/api/docs` when running locally.

### Endpoints Summary

| Module | Endpoints |
|--------|-----------|
| **Auth** | `POST /api/auth/register` `POST /api/auth/login` `POST /api/auth/logout` `POST /api/auth/refresh` `GET /api/auth/me` `PUT /api/auth/avatar` `DELETE /api/auth/account` |
| **Products** | `GET /api/products` `GET /api/products/trending` `GET /api/products/:slug` `POST /api/products` `PUT /api/products/:id` `DELETE /api/products/:id` |
| **Categories** | `GET /api/categories` `GET /api/categories/:slug` `POST /api/categories` `PUT /api/categories/:id` `DELETE /api/categories/:id` |
| **Cart** | `GET /api/cart` `POST /api/cart` `PUT /api/cart/:itemId` `DELETE /api/cart/:itemId` `DELETE /api/cart` |
| **Orders** | `POST /api/orders` `GET /api/orders` `GET /api/orders/:id` `PATCH /api/orders/:id/cancel` |
| **Reviews** | `GET /api/reviews/:productId` `POST /api/reviews/:productId` `PUT /api/reviews/:id` `DELETE /api/reviews/:id` |
| **Wishlist** | `GET /api/wishlist` `POST /api/wishlist` `DELETE /api/wishlist/:productId` `GET /api/wishlist/check/:productId` |
| **Payments** | `POST /api/payments/create-intent` `POST /api/payments/cod` `POST /api/payments/webhook` |
| **Admin** | `GET /api/admin/stats` |

---

## Deployment

### Backend — Render

1. Connect GitHub repo to [Render](https://render.com)
2. Set **Build Command**: `npm install && npx prisma generate && npm run build`
3. Set **Start Command**: `npm start`
4. Add all environment variables from `.env`

### Frontend — Vercel

1. Connect GitHub repo to [Vercel](https://vercel.com)
2. Set **Root Directory**: `frontend`
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL` → your Render backend URL
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → your Stripe key

---

## Author

**Amir Majeed**

Building in public — documenting the full journey of creating a production-ready e-commerce platform.

[![GitHub](https://img.shields.io/badge/GitHub-AmirMajeed4905-black?style=flat&logo=github)](https://github.com/AmirMajeed4905)

---

<div align="center">
  <sub>Built with ❤️ using Next.js, Express, PostgreSQL, and Prisma</sub>
</div>
