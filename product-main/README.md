# 学研社 (XueYanShe) - Learning Resource Platform

A comprehensive academic resource sharing platform for Chinese students covering undergraduate, graduate, postgraduate exam (考研), and civil service exam (考公) preparation.

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── constants.ts       # JWT_SECRET, SERVER_CONFIG
│   ├── db/
│   │   ├── index.ts           # Drizzle DB connection
│   │   ├── schema.ts          # All table definitions + Zod schemas
│   │   └── migrations/
│   │       └── 1776573973243_initial_schema.sql
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── repositories/
│   │   ├── users.ts           # User CRUD
│   │   ├── resources.ts       # Resource CRUD + search
│   │   ├── comments.ts        # Comment CRUD
│   │   ├── points.ts          # Point transactions
│   │   └── teacherCert.ts     # Teacher certification
│   ├── routes/
│   │   ├── auth.ts            # POST /api/auth/signup|login, GET /api/auth/me
│   │   ├── resources.ts       # CRUD + download + review
│   │   ├── points.ts          # Checkin, transactions, exchange
│   │   ├── ai.ts              # AI chat sessions
│   │   ├── teacherCert.ts     # Teacher cert applications
│   │   └── admin.ts           # Admin stats
│   ├── services/
│   │   └── aiService.ts       # Omniflow AI integration
│   └── server.ts              # Express entry point
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── custom/
│       │   │   ├── NavBar.tsx
│       │   │   ├── HomePage.tsx
│       │   │   ├── ResourceListPage.tsx
│       │   │   ├── ResourceDetailPage.tsx
│       │   │   ├── UploadPage.tsx
│       │   │   ├── ProfilePage.tsx
│       │   │   ├── PointsPage.tsx
│       │   │   ├── AdminPage.tsx
│       │   │   └── AIAssistantPage.tsx
│       │   └── ui/            # shadcn/ui components
│       ├── contexts/
│       │   └── AuthContext.tsx # JWT auth state
│       ├── lib/
│       │   └── api.ts         # All API client methods
│       ├── pages/
│       │   ├── Index.tsx      # Main app shell with view routing
│       │   ├── LoginPage.tsx
│       │   └── SignupPage.tsx
│       └── App.tsx            # HashRouter setup
└── shared/
    └── types/
        └── api.ts             # Shared TS types (User, Resource, etc.)
```

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, shadcn/ui, React Router (HashRouter)
- **Backend**: Express.js, TypeScript, Drizzle ORM, postgres.js
- **Auth**: JWT (bcryptjs + jsonwebtoken)
- **AI**: Omniflow AI Service (Cohere Rerank-4-Fast)
- **Database**: PostgreSQL

## Key Features

1. **Resource Library** - Browse/search/filter resources by stage, category, type
2. **Resource Upload** - Upload PDF/DOC/PPT with metadata, pending review
3. **PDF Preview** - In-browser preview with page navigation (10 free pages)
4. **Download System** - Points-based download with confirmation modal
5. **Comments & Ratings** - Star ratings + text reviews with points rewards
6. **AI Assistant** - Chat with AI about resources, study tips (5 free/day)
7. **Points System** - Earn/spend points for all platform actions
8. **Points Exchange** - Redeem points for download packs, AI packs, memberships
9. **Daily Check-in** - Streak-based check-in rewards
10. **Teacher Certification** - V1/V2/V3 certification with fast-track review
11. **Admin Review Panel** - Resource review queue with rejection codes
12. **User Profile** - Upload history, certification status, stats

## API Routes

- `POST /api/auth/signup` - Register (grants 50 points)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user
- `GET /api/resources` - List resources (public)
- `POST /api/resources` - Upload resource (auth)
- `POST /api/resources/:id/download` - Download (auth + points)
- `GET/POST /api/resources/:id/comments` - Comments
- `POST /api/points/checkin` - Daily check-in
- `GET /api/points/transactions` - Point history
- `POST /api/points/exchange` - Exchange points
- `POST /api/ai/chat` - AI chat
- `GET /api/ai/sessions` - Chat history
- `POST /api/teacher-cert/apply` - Apply for certification
- `GET /api/admin/stats` - Admin statistics

## Code Generation Guidelines

- All shared types in `shared/types/api.ts`, import with `@shared/types/api`
- Frontend API calls via `frontend/src/lib/api.ts` using `apiFetch` helper
- Auth state via `useAuth()` hook from `AuthContext`
- Navigation via `AppView` type in `Index.tsx` - add new views there
- Backend routes follow: route → repository → schema pattern
- Points awarded via `addPointTransaction()` in repositories/points.ts
