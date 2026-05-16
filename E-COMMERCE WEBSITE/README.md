# LuxeShop - Luxury E-Commerce Platform

LuxeShop is a production-ready, full-stack e-commerce application built with a premium, editorial aesthetic. It features a robust Node.js/Express backend with Prisma and MongoDB, and a modern React frontend utilizing Tailwind CSS, Zustand, and Framer Motion.

## 🚀 Tech Stack

**Frontend**
- React 18 & Vite
- Tailwind CSS (Custom Design System)
- Zustand (Global State Management with Persistence)
- React Router v6
- Framer Motion (Animations)
- Axios (API Client with Interceptors)

**Backend**
- Node.js & Express
- Prisma ORM
- MongoDB
- JWT Authentication (Access & Refresh Tokens)
- Zod (Request Validation)

**Integrations**
- Stripe (Payments)
- Cloudinary (Image Storage)
- Nodemailer (Emails)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [MongoDB Compass](https://www.mongodb.com/products/compass) (or MongoDB Atlas / Local MongoDB instance)
- npm or yarn

---

## 🛠️ Setup & Installation

### 1. Clone & Install Dependencies

Clone the repository and install dependencies for both the client and server.

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Configuration

You need to set up environment variables for both the backend and frontend.

**Backend (`server/.env`)**
Create a `.env` file in the `server` directory using the provided example:
```bash
cd server
cp .env.example .env
```
Open `server/.env` and update the crucial fields, primarily the `DATABASE_URL`:
```env
# Example MongoDB Connection String
DATABASE_URL="mongodb://localhost:27017/luxeshop"

# Generate a strong random string for your JWT secrets
JWT_SECRET="your_super_secret_key"
JWT_REFRESH_SECRET="your_super_secret_refresh_key"
```

**Frontend (`client/.env`)**
Create a `.env` file in the `client` directory:
```bash
cd ../client
cp .env.example .env
```
*(If `.env.example` doesn't exist, simply create `.env` and add: `VITE_API_URL=http://localhost:5000/api`)*

### 3. Database Setup

Once your `DATABASE_URL` is configured, push the schema to your database and seed it with demo data.

```bash
cd ../server

# Push the Prisma schema to your MongoDB database
npm run db:push

# Run the seed script to populate products, categories, and users
npm run db:seed
```

### 4. Running the Application

You will need to run the client and the server simultaneously in separate terminal windows.

**Terminal 1: Start the Backend Server**
```bash
cd server
npm run dev
```
*(The server will start on http://localhost:5000)*

**Terminal 2: Start the Frontend Client**
```bash
cd client
npm run dev
```
*(The client will start on http://localhost:5173)*

---

## 🔑 Demo Credentials

The database seed script automatically creates demo accounts for you to test the platform.

**Admin Account** (Access to Admin Dashboard)
- **Email:** `admin@luxeshop.com`
- **Password:** `Admin1234!`

**Customer Account** (Standard User)
- **Email:** `customer@luxeshop.com`
- **Password:** `Customer1234!`

---

## 📂 Project Structure

```text
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/            # Axios instance and API endpoint functions
│   │   ├── components/     # Reusable UI components and Layouts
│   │   ├── pages/          # React Router page components
│   │   ├── store/          # Zustand state management (auth, cart, wishlist)
│   │   ├── App.jsx         # Main router setup
│   │   └── index.css       # Global CSS and Tailwind directives
│   └── tailwind.config.js  # Tailwind theme, colors, and animations
│
└── server/                 # Node.js/Express Backend
    ├── prisma/
    │   ├── schema.prisma   # Database schema definitions
    │   └── seed.js         # Database seeding script
    ├── src/
    │   ├── controllers/    # Route controllers (business logic)
    │   ├── middleware/     # Auth, error handling, validation
    │   ├── routes/         # API route definitions
    │   ├── services/       # Stripe, Cloudinary, Email services
    │   └── app.js          # Express app configuration
    └── package.json
```

## ✨ Key Features

- **Dark Mode Premium Aesthetic**: Handcrafted UI emphasizing typography, grain overlays, and smooth micro-interactions.
- **Robust Authentication**: Secure JWT-based authentication with auto-refresh mechanisms.
- **Advanced Cart & Checkout**: Slide-over cart drawer, persistent state, coupon code validation, and a multi-step checkout flow.
- **Comprehensive Admin Panel**: Role-gated dashboard to manage orders, inventory, products, and user accounts.
- **Dynamic Product Catalog**: URL-synchronized filtering (price, category, stock) and pagination.
