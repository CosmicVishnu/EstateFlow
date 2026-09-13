# EstateFlow - Real Estate CRM & Lead Automation REST API

EstateFlow is a production-ready Node.js & Express REST API built with TypeScript, MongoDB (Mongoose), Zod schema validation, JWT authentication, node-cron background scheduling, and Winston logging.

---

## 🚀 Key Features

- **TypeScript Strict Mode**: Zero implicit `any`, fully typed models, controllers, and schemas.
- **Authentication & Authorization**: Secure user registration and login with bcrypt password hashing and signed JWT tokens with role-based access control (`admin`, `agent`, `user`).
- **Data Validation with Zod**: Generic validation middleware parsing and validating `req.body`, `req.query`, and `req.params`, outputting structured `400 Bad Request` messages.
- **Properties Management**: Full CRUD endpoints for real estate properties with search, price filters, status management (`available` / `sold`), and creator ownership protection.
- **Leads & Inquiries Pipeline**: Endpoints to capture leads, filter by status (`new`, `contacted`, `qualified`, `lost`, `closed`), and link leads directly to properties.
- **Automated Stale Lead Cron Job**: Daily midnight scheduler using `node-cron` scanning for unattended leads in `'new'` status older than 48 hours and alerting via Winston logger.
- **Centralized Error Handling**: Unified error middleware translating Mongoose CastErrors, duplicate key constraints, validation failures, JWT errors, and unhandled rejections into standardized JSON error responses.
- **Structured Winston Logging**: Production-grade logging format with timestamps, colorization in development, JSON output in production, and HTTP request latency tracking.

---

## 🏛️ Architectural Highlights

- **Compile-Time vs. Runtime Safety**: While TypeScript validates types at compile time, incoming HTTP payloads can drift at runtime. EstateFlow intercepts incoming requests via generic Zod middleware prior to controller execution, guaranteeing runtime payload validity.
- **Relational Integrity in Document Storage**: Property listings and leads maintain referential links via Mongoose `ObjectId` references (`ref: 'Property'`), combined with lean query hydration via `.populate()` and compound indexing for multi-key lookups.
- **Decoupled Background Tasks**: Background automation (`node-cron`) is isolated from the HTTP request-response cycle, executing maintenance tasks without blocking Node's event loop.

## 📁 Directory Layout

```
estateflow/
├── dist/                          # Compiled JavaScript production build
├── src/
│   ├── config/
│   │   ├── db.ts                  # MongoDB connection & lifecycle management
│   │   └── logger.ts              # Winston structured logger configuration
│   ├── controllers/
│   │   ├── auth.controller.ts     # User register, login, profile
│   │   ├── property.controller.ts # Property CRUD & filtering
│   │   └── lead.controller.ts     # Lead pipeline & property assignment
│   ├── cron/
│   │   └── leadReminder.cron.ts   # Daily stale lead alerting scheduler
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # Bearer token verification & RBAC
│   │   ├── error.middleware.ts    # Centralized error & 404 handlers
│   │   └── validate.middleware.ts # Generic Zod validation middleware
│   ├── models/
│   │   ├── Lead.ts                # Mongoose schema for CRM leads
│   │   ├── Property.ts            # Mongoose schema for properties
│   │   └── User.ts                # Mongoose schema with bcrypt hashing
│   ├── routes/
│   │   ├── auth.routes.ts         # /api/auth routes
│   │   ├── index.ts               # Central router & health check
│   │   ├── lead.routes.ts         # /api/leads routes
│   │   └── property.routes.ts     # /api/properties routes
│   ├── schemas/
│   │   ├── auth.schema.ts         # Zod schemas for auth
│   │   ├── lead.schema.ts         # Zod schemas for leads
│   │   └── property.schema.ts     # Zod schemas for properties
│   ├── types/
│   │   └── index.ts               # JWT payload & Express Request extension
│   ├── app.ts                     # Express app setup & middleware pipeline
│   └── server.ts                  # Server initialization & graceful shutdown
├── .env                           # Environment variables
├── .env.example                   # Environment variable template
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/estateflow?retryWrites=true&w=majority
JWT_SECRET=estateflow_super_secret_jwt_key_2026_production_ready
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
LOG_LEVEL=info
```

---

## 🛠️ Scripts & Commands

```bash
# Install dependencies
npm install

# Start development server with live reload (ts-node-dev)
npm run dev

# Compile TypeScript to JavaScript (dist folder)
npm run build

# Run the compiled production build
npm start
```

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### 1. Health Check
- `GET /health` - API uptime, status, and timestamp.

### 2. Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new agent or admin.
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "SecurePassword123!",
    "role": "agent"
  }
  ```
- `POST /api/auth/login` - Authenticate and receive a JWT Bearer token.
  ```json
  {
    "email": "jane.doe@example.com",
    "password": "SecurePassword123!"
  }
  ```
- `GET /api/auth/me` - *(Protected)* Get profile of the authenticated user.

### 3. Properties (`/api/properties`)
- `GET /api/properties` - List properties with optional query filters:
  - `status`: `available` | `sold`
  - `minPrice`: number
  - `maxPrice`: number
  - `location`: text search
  - `search`: search across title, description, location
  - `page`: default 1
  - `limit`: default 10
- `GET /api/properties/:id` - Fetch single property details.
- `POST /api/properties` - *(Protected)* Create a new property listing.
  ```json
  {
    "title": "Luxury Penthouse Downtown",
    "description": "3-bedroom penthouse with panoramic skyline views and private terrace.",
    "price": 850000,
    "location": "Downtown Metropolis",
    "status": "available"
  }
  ```
- `PUT /api/properties/:id` - *(Protected)* Update property details (creator or admin only).
- `DELETE /api/properties/:id` - *(Protected)* Delete property (creator or admin only).

### 4. Leads (`/api/leads`)
- `POST /api/leads` - Submit a new lead inquiry (public or internal).
  ```json
  {
    "name": "Alex Smith",
    "email": "alex.smith@example.com",
    "phone": "+1-555-0199",
    "notes": "Interested in viewing 3-bedroom downtown apartments.",
    "propertyId": "651a1f4b8f1b2c0012345678"
  }
  ```
- `GET /api/leads` - *(Protected)* Retrieve leads filtered by status (`new`, `contacted`, `qualified`, `lost`, `closed`) and property ID, with pagination.
- `GET /api/leads/:id` - *(Protected)* Get lead details by ID.
- `PATCH /api/leads/:id/assign` - *(Protected)* Assign lead to a specific property.
  ```json
  {
    "propertyId": "651a1f4b8f1b2c0012345678"
  }
  ```
- `PATCH /api/leads/:id/status` - *(Protected)* Update status of a lead.
  ```json
  {
    "status": "contacted"
  }
  ```

---

## ⏰ Background Cron Automation

The cron task is configured in [`src/cron/leadReminder.cron.ts`](file:///C:/Users/Admin/Desktop/EstateFlow/src/cron/leadReminder.cron.ts).
- **Schedule**: Daily at midnight (`0 0 * * *`).
- **Action**: Queries MongoDB for any lead whose status is `'new'` and whose `createdAt` timestamp is older than 48 hours.
- **Notification**: Logs a structured warning through Winston including the lead's name, email, phone, age, and assigned property for immediate follow-up.
