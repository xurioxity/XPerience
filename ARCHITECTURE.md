# Architecture Overview

## System Design

This application follows a modern full-stack architecture using Next.js 14 with the App Router.

```
┌─────────────────────────────────────────────────────┐
│                   Client Browser                     │
│  (React Components + Tailwind CSS)                  │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/HTTPS
                   ▼
┌─────────────────────────────────────────────────────┐
│              Next.js Server                          │
│  ┌─────────────────────────────────────────┐       │
│  │  App Router (Server Components)          │       │
│  │  - page.tsx (SSR)                        │       │
│  │  - layout.tsx                            │       │
│  └─────────────────────────────────────────┘       │
│  ┌─────────────────────────────────────────┐       │
│  │  API Routes (RESTful)                    │       │
│  │  - /api/cafes                            │       │
│  │  - /api/bookings                         │       │
│  │  - /api/auth                             │       │
│  │  - /api/owner                            │       │
│  └─────────────────────────────────────────┘       │
└──────────────────┬──────────────────────────────────┘
                   │ SQL Queries
                   ▼
┌─────────────────────────────────────────────────────┐
│          SQLite Database                             │
│  (gaming-cafes.db)                                   │
│  - cafes, games, time_slots, bookings, owners       │
└─────────────────────────────────────────────────────┘
```

## Key Components

### 1. Frontend Layer

**Pages (Server Components)**
- `app/page.tsx` - Home page with café listings (SSR)
- `app/cafe/[id]/page.tsx` - Café detail page (SSR)
- `app/my-bookings/page.tsx` - User bookings (Client Component)
- `app/owner/page.tsx` - Owner dashboard (Client Component)

**Shared Components (Client Components)**
- `navigation.tsx` - Navigation bar with routing
- `booking-form.tsx` - Booking form with real-time slot selection
- `cafe-details.tsx` - Café information display
- `owner-dashboard.tsx` - Dashboard with tabs for bookings/slots/profile
- `cafe-editor.tsx` - Form to edit café details

**Why Server Components?**
- Better SEO for café listings
- Reduced client-side JavaScript
- Direct database access (secure)
- Faster initial page load

**Why Client Components?**
- Interactive forms and state management
- Real-time updates (bookings, slots)
- Authentication state handling

### 2. API Layer

**RESTful Endpoints**

```
GET    /api/cafes              → List all cafés
GET    /api/cafes/:id          → Get café details with games
PUT    /api/cafes/:id          → Update café (owner only)
GET    /api/cafes/:id/slots    → Get available slots with capacity

POST   /api/bookings           → Create new booking
GET    /api/bookings?email=... → Get user bookings

POST   /api/auth/login         → Owner login (creates JWT)
POST   /api/auth/logout        → Owner logout (clears cookie)
GET    /api/auth/session       → Get current session

GET    /api/owner/bookings     → Get café bookings (owner only)
GET    /api/owner/slots        → Get café slots (owner only)
PUT    /api/owner/slots        → Update slot availability (owner only)
```

**Authentication Flow**

1. Owner submits credentials
2. Server validates against hashed password in DB
3. JWT token created with owner info
4. Token stored in httpOnly cookie
5. Subsequent requests include cookie
6. Middleware validates token

### 3. Database Layer

**Schema Design**

```sql
cafes (1) ─┬─→ (N) games
           ├─→ (N) time_slots ─→ (N) bookings
           └─→ (N) owners
```

**Key Relationships**
- One café has many games
- One café has many time slots
- One time slot has many bookings
- One café has many owners (for future multi-owner support)

**Critical Queries**

*Slot Availability (with booking count):*
```sql
SELECT ts.*, COALESCE(SUM(b.num_pcs), 0) as booked_pcs
FROM time_slots ts
LEFT JOIN bookings b ON ts.id = b.slot_id AND b.status = 'confirmed'
WHERE ts.cafe_id = ?
GROUP BY ts.id
```

This query:
- Gets all slots for a café
- Counts total PCs booked per slot
- Calculates remaining capacity
- Prevents race conditions

## Core Features Explained

### 1. Booking System

**Double-Booking Prevention**

The system uses a capacity-based approach:
1. Each slot has `available_pcs` (e.g., 25)
2. Each booking reserves `num_pcs` (e.g., 2)
3. Query aggregates total booked PCs per slot
4. Remaining capacity = available - booked
5. Booking only succeeds if capacity available

**Atomicity**: SQLite transactions ensure no race conditions

### 2. Slot Management

**Owner Control**
- Owners can disable entire slots (maintenance, events)
- `is_available` flag prevents new bookings
- Existing bookings remain valid
- Real-time updates reflect in booking form

### 3. Authentication

**JWT + HttpOnly Cookies**

*Why JWT?*
- Stateless (no session storage needed)
- Contains owner/café info
- 7-day expiration

*Why HttpOnly Cookies?*
- JavaScript cannot access (XSS protection)
- Automatically sent with requests
- Secure flag in production

**Session Structure**
```typescript
{
  ownerId: number,
  cafeId: number,
  username: string,
  expiresAt: number
}
```

## Data Flow Examples

### Example 1: User Makes Booking

```
1. User selects slot on café page
   └→ GET /api/cafes/:id/slots
      └→ Returns slots with remaining capacity

2. User fills form and submits
   └→ POST /api/bookings
      ├→ Validate slot availability
      ├→ Check remaining capacity
      ├→ Insert booking record
      └→ Return booking confirmation

3. Form refreshes slot list
   └→ GET /api/cafes/:id/slots
      └→ Returns updated capacities
```

### Example 2: Owner Disables Slot

```
1. Owner clicks "Disable" on slot
   └→ PUT /api/owner/slots
      ├→ Verify session cookie (JWT)
      ├→ Check slot belongs to owner's café
      ├→ Update is_available = 0
      └→ Return success

2. Dashboard refreshes data
   └→ GET /api/owner/slots
      └→ Returns updated slot list

3. Customer views café
   └→ GET /api/cafes/:id/slots
      └→ Disabled slot not shown as bookable
```

## Security Considerations

### 1. SQL Injection Prevention
- All queries use prepared statements
- Parameters are properly escaped
- No string concatenation in SQL

### 2. Authentication Security
- Passwords hashed with bcrypt (10 rounds)
- JWT secret should be changed in production
- HttpOnly cookies prevent XSS
- Session expiration after 7 days

### 3. Authorization
- Owner endpoints check session
- Slot/booking updates verify ownership
- No direct database access from client

### 4. Input Validation
- Required fields checked in API
- Email validation
- Number constraints (PCs, slot IDs)
- Date validation for slots

## Performance Optimizations

### 1. Database
- Indexes on foreign keys
- Single query for slots + bookings (JOIN)
- Connection reuse (singleton pattern)

### 2. Frontend
- Server-side rendering for SEO pages
- Client components only where needed
- Lazy loading not required (small app)
- Tailwind CSS (utility-first, tree-shaken)

### 3. API
- No N+1 queries (JOINs used)
- Minimal data transfer (select only needed fields)
- HTTP caching headers (cache: 'no-store' for dynamic data)

## Scalability Considerations

**Current Setup**: Single-server, file-based SQLite

**For Production Scale**:

1. **Database**
   - Migrate to PostgreSQL/MySQL for concurrent writes
   - Add read replicas for read-heavy operations
   - Implement connection pooling

2. **Caching**
   - Redis for session storage
   - Cache café listings (low change frequency)
   - Invalidate on updates

3. **API**
   - Rate limiting per IP/user
   - Request validation middleware
   - API versioning (/api/v1/...)

4. **Frontend**
   - CDN for static assets
   - Image optimization (Next.js Image)
   - Code splitting for large components

5. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Database query analysis

## Testing Strategy

**Unit Tests** (Future)
- Database functions (CRUD operations)
- Authentication utilities (JWT creation/validation)
- Booking logic (capacity calculation)

**Integration Tests** (Future)
- API endpoints with test database
- Booking flow end-to-end
- Authentication flow

**E2E Tests** (Future)
- User booking journey
- Owner dashboard operations
- Cross-browser compatibility

## Deployment Checklist

- [ ] Change JWT_SECRET to secure random string
- [ ] Set NODE_ENV=production
- [ ] Enable secure flag on cookies
- [ ] Add CORS restrictions
- [ ] Set up SSL/TLS (HTTPS)
- [ ] Database backups (sqlite → postgres)
- [ ] Add error logging
- [ ] Set up monitoring
- [ ] Add rate limiting
- [ ] Optimize images
- [ ] Add meta tags for SEO
- [ ] Test on production-like environment

## Future Architecture Changes

### Microservices (For Large Scale)
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Café      │     │   Booking   │     │    Auth     │
│  Service    │◄───►│   Service   │◄───►│   Service   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                    │
       └───────────────────┴────────────────────┘
                          │
                   ┌──────▼──────┐
                   │  API Gateway │
                   └──────────────┘
```

### Event-Driven (For Real-time Updates)
```
Booking Created → Event Bus → WebSocket → Live Dashboard Update
```

### Benefits
- Independent scaling
- Technology flexibility
- Fault isolation
- Team autonomy

---

This architecture provides a solid foundation for an MVP while being extensible for future growth.
