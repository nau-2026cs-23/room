# 学资库 - 学习资料平台

A comprehensive academic resource sharing platform for Chinese university students, graduate students, and civil service exam candidates.

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   ├── constants.ts       # JWT, server config
│   │   ├── passport.ts        # JWT + local auth strategies
│   │   └── s3.ts              # AWS S3 config
│   ├── db/
│   │   ├── index.ts           # Drizzle DB connection
│   │   ├── schema.ts          # All table definitions + Zod schemas
│   │   └── migrations/
│   │       ├── 0_init_add_user_model.sql
│   │       └── 1773474249065_add_platform_tables.sql
│   ├── middleware/
│   │   ├── auth.ts            # authenticateJWT, authenticateLocal
│   │   └── errorHandler.ts
│   ├── repositories/
│   │   ├── users.ts           # UserRepository
│   │   ├── resources.ts       # ResourceRepository, ReviewRepository, FavoriteRepository, DownloadRepository, PointsRepository
│   │   ├── classes.ts         # ClassRepository
│   │   └── upload.ts
│   ├── routes/
│   │   ├── auth.ts            # POST /api/auth/signup, /login, GET /me
│   │   ├── resources.ts       # CRUD + download/favorite/review/report
│   │   ├── profile.ts         # GET/PUT profile, uploads, favorites, points, checkin
│   │   ├── classes.ts         # Class management + join by code
│   │   ├── admin.ts           # Pending review, approve/reject, user management
│   │   └── upload.ts          # S3 file upload
│   └── server.ts
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── custom/
│       │   │   ├── Navbar.tsx          # Sticky nav with user menu
│       │   │   ├── HomePage.tsx        # Hero, categories, resource grid, CTA sections
│       │   │   ├── ResourceCard.tsx    # Reusable resource card
│       │   │   ├── ResourcesView.tsx   # Browse + search + filter
│       │   │   ├── ResourceDetailView.tsx  # Detail + reviews + download + report
│       │   │   ├── UploadView.tsx      # Upload form with classification
│       │   │   ├── ProfileView.tsx     # Favorites, uploads, points, classes tabs
│       │   │   ├── AdminView.tsx       # Pending review queue, users, reports
│       │   │   ├── Login.tsx
│       │   │   └── Signup.tsx
│       │   └── ui/                    # shadcn/ui components
│       ├── contexts/
│       │   └── AuthContext.tsx         # JWT auth state
│       ├── lib/
│       │   ├── api.ts                  # All API service methods
│       │   └── utils.ts
│       ├── pages/
│       │   └── Index.tsx               # Main navigation hub
│       ├── types/
│       │   └── index.ts                # All TypeScript types + label maps
│       ├── App.tsx                     # HashRouter + AuthProvider + routes
│       └── index.css                   # Academic Blue theme tokens
```

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS V4, shadcn/ui, React Router DOM (HashRouter)
- **Backend**: Express.js, TypeScript, Drizzle ORM, Passport.js (JWT + Local)
- **Database**: PostgreSQL
- **Auth**: JWT tokens, bcrypt password hashing

## Key Features

1. **Resource Browse & Search** - Filter by category, subject, stage, type; sort by latest/downloads
2. **Resource Upload** - Form with classification, points threshold, file URL
3. **Review System** - Star ratings + comments on resources
4. **Favorites** - Multi-folder favorites management
5. **Points System** - Earn on upload approval, spend on paid downloads, daily check-in
6. **Class Management** - Teachers create classes with codes, students join by code
7. **Admin Panel** - Review queue (approve/reject), user management, teacher verification, reports
8. **Authentication** - JWT-based login/signup with protected routes

## Database Tables

- `Users` - Extended with role, points, teacher verification
- `Resources` - Learning materials with category/subject/stage classification
- `Reviews` - Star ratings + comments
- `Favorites` - Multi-folder favorites
- `PointsTransactions` - Points ledger
- `Classes` - Teacher-created class spaces
- `ClassMembers` - Class membership
- `Reports` - Content violation reports
- `Downloads` - Download history

## API Routes

- `POST /api/auth/signup` - Register (returns JWT)
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/auth/me` - Current user
- `GET /api/resources` - List resources (public, filterable)
- `POST /api/resources` - Upload resource (auth)
- `POST /api/resources/:id/download` - Download + deduct points
- `POST /api/resources/:id/reviews` - Submit review
- `POST /api/resources/:id/favorite` - Add to favorites
- `POST /api/resources/:id/report` - Report resource
- `GET /api/profile/uploads` - My uploads
- `GET /api/profile/favorites` - My favorites
- `GET /api/profile/points` - Points balance + history
- `POST /api/profile/checkin` - Daily check-in (+50 pts)
- `GET /api/classes/my` - My classes
- `POST /api/classes` - Create class (teacher)
- `POST /api/classes/join` - Join by code
- `GET /api/admin/pending` - Pending review queue
- `POST /api/admin/resources/:id/approve` - Approve + award points
- `POST /api/admin/resources/:id/reject` - Reject with reason

## Code Generation Guidelines

- All navigation is state-based in `Index.tsx` (no URL routing for views)
- API calls use `frontend/src/lib/api.ts` with `getAuthHeaders()` helper
- Types defined in `frontend/src/types/index.ts`
- Academic Blue color scheme: primary `#1A3A6B`, secondary `#2E6BE6`, accent `#F59E0B`
- Repository pattern: routes → repositories → Drizzle ORM
- Admin/teacher routes protected by `requireAdmin` middleware
