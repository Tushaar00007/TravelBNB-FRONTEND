
# TravelBNB — Frontend

React + Vite frontend for TravelBNB, an AI-powered travel booking and planning platform. Handles property browsing, bookings, host dashboards, messaging, admin panels, and AI itinerary generation.

This is one of three services that make up TravelBNB:
- **Frontend** (this repo) — React + Vite
- **Backend** — [travelbnb-backend](https://github.com/Tushaar00007/travelbnb-backend) (FastAPI + MongoDB)
- **ML Service** — [ai-travel-planner](https://github.com/Tushaar00007/ai-travel-planner) (FastAPI + Python ML)

---

## Live Deployment

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://travel-bnb-frontend.vercel.app |
| Backend API | https://travelbnb-backend.onrender.com |
| ML Service | https://ai-travel-planner-txji.onrender.com |

---

## Project Structure

```
travelbnb-frontend/
└── src/
    ├── features/
    │   ├── admin/              # Admin dashboard (users, listings, bookings)
    │   │   └── pages/
    │   │       ├── CreateAdmin.jsx
    │   │       ├── UsersTable.jsx
    │   │       ├── ListingsTable.jsx
    │   │       └── BookingsTable.jsx
    │   ├── auth/               # Login, signup, OTP, Google OAuth
    │   ├── crashpads/          # Crashpad listings
    │   │   └── pages/
    │   │       ├── Crashpads.jsx
    │   │       └── CreateCrashpad.jsx
    │   ├── host/               # Host dashboard (7 tabs)
    │   │   └── pages/
    │   │       └── EditListingPage.jsx
    │   ├── listings/           # Property browsing and detail
    │   ├── travel/
    │   │   └── pages/
    │   │       └── AiPlanner.jsx   # AI itinerary generator
    │   └── user/
    │       └── components/
    │           └── ChatWindow.jsx  # Host-guest messaging
    ├── components/             # Shared UI components
    ├── services/
    │   └── api.js              # Axios instance with JWT interceptor
    ├── App.jsx
    └── main.jsx
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| HTTP Client | Axios (shared instance in `src/services/api.js`) |
| State | React Context + hooks |
| Routing | React Router v6 |
| Image Handling | Cloudinary URLs |
| Auth | JWT (Bearer tokens in localStorage) |
| Deployment | Vercel |

---

## Environment Setup

```bash
npm install
```

Create `.env` file:
```env
VITE_API_BASE_URL=https://travelbnb-backend.onrender.com/api
```

```bash
npm run dev
```

The app runs on `http://localhost:5173` by default.

For local development against a local backend:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## API Client

All API calls go through the shared axios instance in `src/services/api.js`:

```javascript
import API from '@/services/api';

// GET request
const { data } = await API.get('/crashpads/');

// POST with JWT auto-attached
const { data } = await API.post('/bookings/', bookingPayload);
```

The axios instance automatically:
1. Reads `VITE_API_BASE_URL` from env (falls back to `/api` in production)
2. Attaches `Authorization: Bearer <token>` from localStorage
3. On `401` → clears auth state and redirects to login

---

## Key Features

### Property Listings
Browse crashpads with filters for location, price, and property type. Images served from Cloudinary via the `getImageUrl` helper.

### Booking Flow
User selects dates on property detail → sends booking request (as chat message to host) → host approves via Messages tab → user completes payment on Payment page → booking appears in My Bookings.

Booking metadata (dates, guest count) is extracted from message text via regex.

### Host Dashboard
Seven tabs for hosts to manage their properties:
1. Overview — stats and recent bookings
2. Listings — manage property listings
3. Calendar — booking availability
4. Earnings — revenue and payouts
5. Reviews — guest reviews
6. Messages — guest conversations, booking approvals
7. Notifications — alerts and requests

### Admin Panel
Dashboard with stats (users, listings, bookings, revenue) and CRUD tables. Requires `admin` or `super_admin` role.

### AI Travel Planner
User fills preferences (destination, budget, days, travelers, interests) → frontend calls `/api/ml/generate` → backend proxies to ML service → returns day-wise itinerary with hotels → user can save and download as PDF.

### Messaging
Real-time host-guest chat with booking approve/decline actions, read receipts, and payment triggers embedded in messages.

---

## Role-Based Access

| Role | Capabilities |
|------|-------------|
| `user` | Browse, book, chat, generate itineraries |
| `host` | User capabilities + listings management, booking approval, earnings |
| `admin` | Manage users, listings, bookings, view analytics |
| `super_admin` | Admin capabilities + create/delete other admins |

---

## Deployment (Vercel)

1. Connect this repo to Vercel
2. Vercel auto-detects Vite — no build config needed
3. Add environment variable in Settings → Environment Variables:
   `VITE_API_BASE_URL=https://travelbnb-backend.onrender.com/api`
   Apply to Production, Preview, and Development scopes.
4. Deploy — Vercel redeploys automatically on push to `main`

**Important:** changing env vars alone does not rebuild. Trigger a manual redeploy after updating env vars.

---

## Key Design Decisions

- **Shared axios instance** — all API calls go through `src/services/api.js` so JWT attachment, base URL, and error handling are centralized.
- **Cloudinary for images** — migrated from base64-in-MongoDB. `getImageUrl` helper handles both legacy and current URL formats.
- **Inline styles over Tailwind for component-specific tweaks** — Tailwind for layout, inline styles for precise adjustments.
- **No component library** — all UI components are custom-built or use lucide-react for icons only.
- **Messages store booking metadata as text** — regex extraction on the frontend rather than structured fields in the DB.
