# Veloce — Intelligent Car Rental Management System

> A modern, full-stack enterprise car rental platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **MongoDB**. Provides complete lifecycle coverage across 4 dedicated role-based portals: **Customer**, **Staff Operations**, **Fleet Maintenance**, and **System Administration**.

---

## 🌟 Key Features

### 1. Multi-Role Portal Architecture
* **Customer Portal (`/customer`):**
  - **Live Fleet Discovery (`/customer/fleet`):** Real-time vehicle availability, category filters (Economy, Sedan, SUV, Luxury), transmission, and fuel type filters with in-portal instant booking drawer.
  - **Active Rental Cockpit (`/customer/active-rental`):** Live rental countdown timer, telemetry odometer/fuel tracking, digital trip verification, and emergency dispatch links.
  - **Booking History (`/customer/bookings`):** Tabbed views for Active, Upcoming, Completed, and Cancelled reservations with printable receipts.
  - **KYC & Verification (`/customer/documents`):** Driver's license upload, selfie verification, and approval status tracker.
  - **Payments & Invoices (`/customer/payments`):** Transparent digital receipts, breakdown of base daily rates, taxes, and security deposit hold status.

* **Staff Operations Portal (`/staff`):**
  - **Fleet Inventory (`/staff/vehicles`):** Add, update, and manage vehicle operational states (`available`, `reserved`, `rented`, `returned`, `maintenance`). Includes breadcrumb navigation and **Back to Dashboard** routing.
  - **Bookings Queue (`/staff/bookings`):** Review pending customer reservations and process handovers.
  - **Digital Handover (`/staff/handover`):** Pre-rental inspection checklist, odometer verification, fuel level signoff, and digital customer signature capture.
  - **Vehicle Returns (`/staff/returns`):** Post-rental audit engine, automated calculation of mileage and fuel deficit penalties, and instant deposit settlement.
  - **Damage Management (`/staff/damage`):** Visual damage inspection, severity grading, and repair cost estimation.

* **Maintenance Portal (`/maintenance`):**
  - **Service Work Orders:** Schedule, track, and complete vehicle repairs. Automatically marks vehicles under service to prevent booking conflicts.
  - **Official Documents & Warranties (`/maintenance/documents`):** Downloadable official diagnostic reports, parts warranty certificates (Brembo, Tesla HV Battery, Suspension, Synthetic Oil), and batch PDF downloads.

* **Executive Administrator Portal (`/admin`):**
  - **Executive Control Center (`/admin`):** Real-time commercial KPIs (Gross Revenue, Active Fleet Utilization, Net Operating Profit), interactive visual analytics, and live fleet status tracking.
  - **Enterprise Reports (`/admin/reports`):** In-depth financial analytics with instant **Export CSV**, **Export PDF**, and **Raw JSON** database downloads.
  - **Bookings Master Ledger (`/admin/bookings`):** Global audit of all rental transactions with one-click spreadsheet and PDF report exports.
  - **User Management (`/admin/users`):** Create and manage Customer, Staff, Maintenance, and Admin user accounts directly in MongoDB.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router)** | Full-stack architecture with React Server & Client Components |
| **UI & Styling** | **Tailwind CSS + Vanilla CSS** | Curated dark/light theme system, responsive glassmorphism, micro-animations |
| **Database** | **MongoDB Atlas / Compass** | Document database for vehicles, users, bookings, payments, and service logs |
| **Authentication** | **JWT (`jose`) + `bcryptjs`** | Secure session cookies with strict Role-Based Access Control (RBAC) |
| **Document Engine** | **Native PDF & CSV Generators** | Pure zero-dependency client-side PDF 1.4 binary synthesis & UTF-8 BOM CSV exports |
| **Language** | **TypeScript 5.9** | Strict type safety across entities, store actions, and API endpoints |

---

## 🗄️ Database Architecture & MongoDB Compass

The application connects to **MongoDB** (compatible with MongoDB Atlas or local MongoDB instances) via the official Node.js `mongodb` driver.

### Database Name: `car_rental_db`

### Collections Managed:
1. **`vehicles`**: Vehicle catalog with specifications (`make`, `model`, `year`, `registrationNumber`, `vin`, `category`, `dailyRate`, `fuelType`, `transmission`, `seats`, `mileage`, `fuelLevel`, `status`, `imageUrl`, `color`).
2. **`users`**: User records with `passwordHash` (bcrypt), `email`, `name`, `phone`, `role` (`customer`, `staff`, `maintenance`, `admin`), and department/address.
3. **`bookings`**: Full rental records (`bookingCode`, `customerId`, `customerName`, `vehicleId`, `vehicleName`, `startDate`, `endDate`, `totalCost`, `securityDeposit`, `status`, `paymentStatus`, `paymentMethod`).
4. **`maintenance`**: Workshop service tickets, diagnostic logs, parts utilized, technician assignments, and cost accounting.
5. **`payments`**: Digital transaction receipts, payment methods, and deposit hold records.

---

## 🚀 Getting Started & How to Run

### 1. Prerequisites
- **Node.js** (v18.17+ or v20+ recommended)
- **npm** (or yarn / pnpm)
- **MongoDB** (MongoDB Atlas cloud URI or local MongoDB server)
- **MongoDB Compass** (optional GUI for managing data)

### 2. Clone and Install Dependencies
```bash
# Navigate to the project directory
cd car-rental-management-system

# Install dependencies
npm install
```

### 3. Environment Configuration
Create or update the `.env` file in the root directory:
```env
# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/car_rental_db?retryWrites=true&w=majority
MONGODB_DB=car_rental_db

# Security & Session Secret
JWT_SECRET=super-secret-jwt-token-for-car-rental-app-2026-development-key
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 🔐 Default Access Accounts

The MongoDB database is pre-seeded with default role accounts. All default accounts share the password: **`password123`**

| Role | Email | Accessible Portals |
| :--- | :--- | :--- |
| **System Administrator** | `admin@carrent.com` | Full Enterprise Clearance (`/admin`, `/staff`, `/maintenance`, `/customer`) |
| **Front Desk Staff** | `staff@carrent.com` | Operations, Handover, Returns, Fleet Inventory (`/staff`) |
| **Fleet Technician** | `maint@carrent.com` | Workshop Diagnostics, Work Orders, Warranties (`/maintenance`) |
| **Customer** | `customer@carrent.com` | Fleet Browsing, Bookings, Active Rental, KYC (`/customer`) |

*(Additional customer accounts available: `alex@example.com`, `priya@example.com`)*

---

## 📑 In-App Document & Data Downloads

The platform features a built-in document engine that generates clean, official files directly in the browser:

1. **Maintenance PDF Certificates (`/maintenance/documents`):**
   - Click **Download PDF** on any warranty certificate (e.g. Brembo Ceramic Brakes, Tesla HV Battery Diagnostic, Suspension Alignment) to generate and download a genuine `.pdf` document with official inspection checkpoints and technician signoffs.
2. **Admin Car Rental Ledger Export (`/admin` and `/admin/reports`):**
   - **Download Bookings (.csv):** Exports the complete tabular ledger of customer reservations for Microsoft Excel or Google Sheets.
   - **Download Executive Audit (.pdf):** Generates an executive summary document complete with revenue totals, fleet allocation, and booking status tables.
   - **Master System Backup (.json):** Exports raw database records for offline archiving.

---

## 📂 Project Directory Structure

```
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (public)/             # Landing page, /about, /contact, /vehicles
│   │   ├── login/                # Clean role-based sign in page
│   │   ├── register/             # Customer registration page
│   │   ├── customer/             # Customer Portal (Dashboard, Fleet, Bookings, Active, Payments, Docs)
│   │   ├── staff/                # Staff Portal (Dashboard, Bookings, Vehicles, Handover, Returns, Damage)
│   │   ├── maintenance/          # Maintenance Portal (Dashboard, Work Orders, Documents)
│   │   ├── admin/                # Admin Portal (Executive Dashboard, Reports, Bookings, Users, Live Map)
│   │   └── api/                  # Backend REST API routes
│   │       ├── auth/             # Login, register, session endpoints
│   │       ├── vehicles/         # MongoDB CRUD for fleet vehicles
│   │       ├── bookings/         # Availability checks & booking creation
│   │       ├── users/            # Administrative user accounts management
│   │       └── maintenance/      # Service orders & inspection records
│   ├── components/               # Reusable UI components
│   │   ├── portal/               # PortalShell, Drawer, Modal, Toast, InteractiveChart
│   │   ├── Navbar.tsx            # Public top navigation
│   │   ├── Footer.tsx            # Landing footer with 24/7 hotline & support
│   │   └── ThemeToggle.tsx       # Dark & Light mode toggle
│   └── lib/                      # Core business logic & services
│       ├── mongodb.ts            # MongoDB connection caching & collection getters
│       ├── exportUtils.ts        # Client-side PDF, CSV, and JSON download engine
│       ├── auth.ts               # JWT creation, verification, and bcrypt hashing
│       ├── rentalStore.ts        # Client-side state machine & optimistic store
│       └── types.ts              # TypeScript domain interfaces
├── .env                          # MongoDB connection string & secrets
├── package.json                  # Dependencies and build scripts
└── README.md                     # Project documentation
```

---

## 🔒 Security & Role-Based Access Control (RBAC)

1. **Password Encryption:** All passwords stored in MongoDB are hashed using `bcryptjs` with salt rounds. Plaintext passwords are never saved or returned in API responses.
2. **JWT Session Verification:** Routes verify identity using signed `jose` JWT cookies.
3. **Route Guards:** Server-side route handlers use `requireRole(["admin", "staff", ...])` to reject unauthorized requests before any database query executes.
4. **Client Guards:** `<PortalShell>` automatically redirects users attempting to access a portal outside their clearance level.

---

## 📄 License
This project is open-source and intended for educational and commercial fleet management demonstrations.
