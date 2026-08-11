# Servants Web & Mobile App

---

## Overview

Servants is a comprehensive management system designed for organizations (like churches) to coordinate servants, services, and roles. It provides a streamlined interface for both users and administrators to manage schedules, track service openings, handle role assignments, and communicate in real time across web and mobile platforms.

## Tech Stack

### Frontend (Web)
- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **Routing:** React Router 7
- **Icons:** Lucide React & Heroicons
- **Date Handling:** date-fns

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** PostgreSQL (using `pg` driver)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **File Storage:** Multer & Cloudinary
- **Real-time:** WebSocket (`ws`)
- **Logging:** Pino & pino-http
- **Task Scheduling:** node-cron
- **Messaging:** Twilio
- **Push Notifications:** expo-server-sdk (for sending push notifications to Expo devices)

### Native (Mobile)
- **Framework:** React Native with Expo (SDK 57)
- **Routing:** Expo Router v57
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Animations/Gestures:** React Native Reanimated & React Native Gesture Handler
- **Storage:** AsyncStorage & SQLite (`expo-sqlite`)
- **Push Notifications:** Expo Notifications
- **Icons:** Lucide React Native & Expo Vector Icons
- **Images:** expo-image
- **File Picking:** expo-document-picker
- **UI Effects:** expo-glass-effect
- **Graphics:** react-native-svg

## Features

- **Multi-Level Authentication:** Separate registration and login flows for users and administrators, with role-based protected routes.
- **Password Recovery:** OTP-based "Forgot Password" functionality via Twilio.
- **Dashboard:** At-a-glance view of upcoming services, active roles, and organizational statistics.
- **Service Management:** Admins can create, edit, and delete services, including specific opening slots.
- **Role System:** Flexible role management allowing admins to assign or relieve specific responsibilities to servants.
- **Openings:** Servants can view and sign up for open service slots.
- **Schedule Tracking:** Comprehensive view of service schedules and volunteer assignments.
- **Real-time Chat:** Live messaging powered by WebSockets, featuring group chats per service, image attachments, read receipts, and swipe-to-reply gestures on mobile.
- **Admin Panel:** Dedicated admin views for managing users, admissions, roles, and services.
- **Personal Notes (Mobile):** A color-coded, multipage local notepad on the mobile app for quick, persistent personal notes, utilizing SQLite and AsyncStorage.
- **Cross-Platform:** Available as a responsive Web App and a Native Mobile App (iOS/Android).

## Project Structure

```text
servants-postgresql/
├── client/                       # React Web Frontend
│   ├── src/
│   │   ├── api.ts                # API client configuration
│   │   ├── App.tsx               # Main routing component
│   │   ├── assets/               # Static assets (images, fonts, etc.)
│   │   ├── components/           # Reusable UI components
│   │   ├── context/              # Auth and global state
│   │   ├── hooks/                # Custom React hooks (e.g., WebSocket)
│   │   ├── pages/                # Full-page components
│   │   └── utils/                # Shared utility functions
│   └── vite.config.ts
├── server/                       # Express Backend
│   ├── src/
│   │   ├── api/                  # API router and feature modules (Controller → Service → Repository)
│   │   ├── core/                 # Server config, middleware, error handling, logger
│   │   ├── postgre/              # PostgreSQL connection & schema
│   │   │   ├── database.sql      # Full database schema (tables & ENUMs)
│   │   │   └── db.js             # pg pool connection
│   │   ├── utils/                # Shared server utilities
│   │   │   ├── caseConvert.js    # camelCase / snake_case conversion
│   │   │   ├── password.js       # bcrypt hashing helpers
│   │   │   ├── pushNotifications.js  # Expo push notification sender
│   │   │   └── uploadToCloudinary.js # Cloudinary upload helper
│   │   └── server.js             # Entry point
│   └── package.json
└── native/                       # Expo Mobile App
    ├── api.ts                    # API base URL configuration
    ├── src/
    │   ├── app/                  # Expo Router pages (file-based routing)
    │   ├── context/              # Auth context
    │   ├── hooks/                # Custom hooks (e.g., chat socket)
    │   ├── images/               # Local image assets
    │   └── utils/                # Shared utility functions
    │       ├── notifications.ts  # Push notification helpers
    │       ├── tokenUtils.ts     # JWT token helpers
    │       └── functions.ts      # General utilities
    ├── app.json                  # Expo configuration
    └── eas.json                  # EAS Build configuration
```

## Environment Variables

### Server (`server/.env`)
| Variable | Description |
|---|---|
| `NODE_ENV` | Application environment (`development` \| `production`) |
| `PORT` | Server port (default: `5000`) |
| `PG_USER` | PostgreSQL username |
| `PG_PASSWORD` | PostgreSQL password |
| `PG_HOST` | PostgreSQL host (default: `localhost`) |
| `PG_PORT` | PostgreSQL port (default: `5432`) |
| `PG_DATABASE` | PostgreSQL database name (default: `servants`) |
| `JWT_SECRET` | Secret key for JWT signing |
| `CORS_ORIGIN` | Allowed origin for frontend requests (e.g., your Vercel URL) |
| `TWILIO_ACCOUNT_SID` | Twilio account SID for SMS |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token |
| `TWILIO_VERIFY_SERVICE_SID` | Twilio verify service SID |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for file storage |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Client (`client/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | The base URL for the backend API |

### Native (`native/.env`)
| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | The base URL for the backend API (e.g., `http://10.0.2.2:5000/api` for Android emulator) |

## Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- A running PostgreSQL instance

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd servants-postgresql
   ```

2. **Database Setup**
   Ensure your PostgreSQL instance is running. Create the database and run `server/src/postgre/database.sql` to set up all tables and ENUMs. The schema will be automatically applied on server start.

3. **Backend Setup**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Fill in all PG_* database values and the other required variables in .env
   ```

4. **Web Client Setup**
   ```bash
   cd ../client
   npm install
   cp .env.example .env
   # Edit .env and set VITE_API_URL to your backend URL
   ```

5. **Native App Setup**
   ```bash
   cd ../native
   npm install
   cp .env.example .env
   # Set EXPO_PUBLIC_API_URL to your backend URL
   ```

### Running the Application Locally

You will need multiple terminal windows to run all parts of the stack.

1. **Start the Server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Web Client**
   ```bash
   cd client
   npm run dev
   ```
   The client will be available at `http://localhost:5173`.

3. **Start the Native App**
   ```bash
   cd native
   npx expo start
   # Or use dedicated shortcuts:
   npm run android   # Launch directly on Android emulator
   npm run ios       # Launch directly on iOS simulator
   ```
   Use the Expo Go app on your physical device to scan the QR code, or press `a` for Android emulator / `i` for iOS simulator.

## API & Database

### REST API
The REST API is exposed under `/api` and is organized into the following resource modules:

| Module | Base Path | Description |
|---|---|---|
| Users | `/api/users` | Registration, login, profile, push token |
| Services | `/api/services` | CRUD for church services |
| Roles | `/api/roles` | Role management per service |
| Assignments | `/api/assignments` | Servant role assignments |
| Chats | `/api/chats` | Chat message history |
| File | `/api/file` | File upload to Cloudinary |

Real-time messaging uses **WebSockets** on the same server instance. The WebSocket endpoint follows this URL pattern:

```
ws://<host>/ws/chats/:serviceId
```

> **WebSocket Note:** The WebSocket URL is derived automatically from `VITE_API_URL` / `EXPO_PUBLIC_API_URL` by replacing `http` with `ws` (or `https` with `wss`). When deploying behind a reverse proxy (e.g., Render, Nginx), ensure WebSocket upgrade headers are forwarded correctly.

### Database Schema
The backend uses **PostgreSQL** with the following tables and custom ENUM types:

**Tables:**
| Table | Description |
|---|---|
| `users` | All registered users (volunteers & admins) |
| `services` | Church services with date, time, and status |
| `roles` | Named roles within a service (with spot counts) |
| `assignments` | Links users to roles with a status |
| `chats` | All chat messages per service (unified chat table) |

**ENUM Types:**
| Type | Values |
|---|---|
| `user_role` | `admin`, `volunteer` |
| `service_status` | `Roles Open`, `Roles Closed` |
| `assignment_status` | `confirmed`, `pending`, `declined` |
| `chat_status` | `success`, `pending`, `failed` |

### Web Routes (Client)

| Route | Page | Access |
|---|---|---|
| `/` | Landing | Public |
| `/login` | User Login | Public |
| `/register` | User Registration | Public |
| `/admin/login` | Admin Login | Public |
| `/admin/register` | Admin Registration | Public |
| `/forgot-password` | Forgot Password | Public |
| `/home` | Dashboard | Protected |
| `/schedule` | Schedule | Protected |
| `/openings` | Role Openings | Protected |
| `/chats` | Real-time Chat | Protected |
| `/admin/services` | Manage Services | Admin only |
| `/admin/services/create` | Create a Service | Admin only |
| `/admin/roles` | Manage Roles | Admin only |
| `/admin/admissions` | Manage Admissions | Admin only |
| `/admin/users` | Manage Users | Admin only |

## Authentication & Token Storage

JWTs are issued by the server on login and stored client-side. All protected API requests require the `Authorization: Bearer <token>` header.

| Platform | Storage Mechanism |
|---|---|
| Web | `localStorage` (keys: `token`, `user`) |
| Native | `expo-secure-store` (token) + `AsyncStorage` (user metadata) |

Tokens are validated on every protected route. Expired tokens are automatically cleared and the user is redirected to login.

## Tooling

All three packages (client, server, native) share a consistent tooling setup:

| Tool | Purpose |
|---|---|
| **ESLint** | Code linting (`npm run lint` / `npm run lint:fix`) |
| **Prettier** | Code formatting (`npm run format`) |
| **TypeScript** | Static typing (client & native) |
| **nodemon** | Server hot-reload in development (`npm run dev`) |
| **pino-pretty** | Human-readable server logs in development |

## Deployment

### Frontend (Web)
Configured for deployment on **Vercel** (`vercel.json` included for routing rewrites). Set `VITE_API_URL` in the Vercel environment variables dashboard.

### Backend
Can be deployed to any Node.js hosting provider (e.g., Render, Railway). Set all required environment variables and ensure the PostgreSQL credentials are correct. In production, environment variables are injected directly — no `.env` file is needed.

### Native App
Configured for **EAS Build** (use `eas.json.example` as a template). Two build profiles are defined:

| Profile | Distribution | Android Output | Use Case |
|---|---|---|---|
| `preview` | Internal | APK | Testing on a physical device before release |
| `production` | Store | AAB | App store release (auto-increments version) |

Before triggering a build, copy the EAS configuration template:
```bash
cp eas.json.example eas.json
# Edit eas.json to configure your build profiles and environment variables
```

To trigger a build:
```bash
# Install EAS CLI if you haven't already
npm install -g eas-cli

# Authenticate with your Expo account
eas login

# Build for Android
eas build --platform android --profile preview
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

> **Note on Android Push Notifications (`google-services.json`):**
> Firebase Cloud Messaging (FCM) is required for Android push notifications. `google-services.json` is **not** committed to this repository. Before running an EAS build, you must:
> 1. Go to the [Firebase Console](https://console.firebase.google.com) and open (or create) the project for this app.
> 2. Download `google-services.json` from **Project Settings → Your apps → Android app**.
> 3. Place it at `native/google-services.json`.
>
> EAS Credentials (`eas credentials`) manages your Android **keystore** and iOS **certificates** — it does **not** handle `google-services.json`. The file must be present locally before running `eas build`.

#### Important Note on Push Notifications and Building
When running the app locally using **Expo Go**, native push notification registration can cause issues or unsupported behavior in the Expo Go sandbox environment. For this reason, the push notification logic has been temporarily commented out for local development.

Specifically, you will find commented code in the following files:
- `native/src/app/_layout.tsx`: Logic for dismissing push notifications when the app transitions from the background to the active state.
- `native/src/app/(tabs)/_layout.tsx`: Logic for registering the device's push notification token and sending it to the backend database.

**Action Required:** When you are ready to actually build the standalone app using EAS, you **must uncomment** the code in both of these files. This ensures that push notifications will work correctly in your production application.
# servants-gsk
