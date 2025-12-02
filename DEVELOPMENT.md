# Development Guide

This guide is for developers who want to understand or extend the codebase.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup database**
   ```bash
   npm run setup
   ```

3. **Verify setup**
   ```bash
   npm run verify
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## Project Structure Explained

### Frontend (React + Next.js)

```
app/
├── page.tsx                    # Home - SSR, lists cafés
├── cafe/[id]/page.tsx         # Café detail - SSR, shows café + booking form
├── my-bookings/page.tsx       # User bookings - CSR, email-based lookup
├── owner/page.tsx             # Owner dashboard - CSR, auth required
├── layout.tsx                 # Root layout with navigation
├── globals.css                # Tailwind + custom styles
└── api/                       # API routes (see below)

components/
├── navigation.tsx             # Top nav bar (client component)
├── booking-form.tsx           # Booking form with slot picker (client)
├── cafe-details.tsx           # Café info display (client)
├── cafe-editor.tsx            # Edit café form (client)
├── owner-login.tsx            # Login form (client)
└── owner-dashboard.tsx        # Dashboard tabs (client)
```

### Backend (API Routes)

```
app/api/
├── cafes/
│   ├── route.ts               # GET /api/cafes (list all)
│   └── [id]/
│       ├── route.ts           # GET/PUT /api/cafes/:id
│       └── slots/route.ts     # GET /api/cafes/:id/slots
├── bookings/
│   └── route.ts               # POST /api/bookings, GET /api/bookings?email=
├── auth/
│   ├── login/route.ts         # POST /api/auth/login
│   ├── logout/route.ts        # POST /api/auth/logout
│   └── session/route.ts       # GET /api/auth/session
└── owner/
    ├── bookings/route.ts      # GET /api/owner/bookings
    └── slots/route.ts         # GET/PUT /api/owner/slots
```

### Database & Utilities

```
lib/
├── db.ts                      # SQLite connection + schema
├── auth.ts                    # JWT utilities
└── types.ts                   # TypeScript interfaces

scripts/
├── setup-db.js                # Database initialization
└── verify-setup.js            # Setup verification
```

## Key Concepts

### Server vs Client Components

**Server Components** (default in Next.js 14):
- Run on server only
- Can access database directly
- Better for SEO
- Examples: `app/page.tsx`, `app/cafe/[id]/page.tsx`

**Client Components** (need 'use client'):
- Run in browser
- Handle interactivity
- Manage state
- Examples: forms, dashboards, anything with useState/useEffect

### API Route Structure

All API routes follow this pattern:

```typescript
// app/api/example/route.ts
import { NextResponse } from 'next/server';

// GET /api/example
export async function GET(request: Request) {
  try {
    // 1. Extract parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // 2. Query database
    const data = db.prepare('SELECT * FROM table WHERE id = ?').get(id);

    // 3. Return JSON response
    return NextResponse.json(data);
  } catch (error) {
    // 4. Handle errors
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// POST /api/example
export async function POST(request: Request) {
  const body = await request.json();
  // ... handle POST
}
```

### Database Queries

**Always use prepared statements:**

```typescript
// ✅ GOOD - Safe from SQL injection
const cafe = db.prepare('SELECT * FROM cafes WHERE id = ?').get(cafeId);

// ❌ BAD - Vulnerable to SQL injection
const cafe = db.prepare(`SELECT * FROM cafes WHERE id = ${cafeId}`).get();
```

**Complex queries with JOINs:**

```typescript
// Get slots with booking counts
const slots = db.prepare(`
  SELECT 
    ts.*,
    COALESCE(SUM(b.num_pcs), 0) as booked_pcs
  FROM time_slots ts
  LEFT JOIN bookings b ON ts.id = b.slot_id AND b.status = 'confirmed'
  WHERE ts.cafe_id = ?
  GROUP BY ts.id
`).all(cafeId);
```

### Authentication Flow

1. **Login** (`POST /api/auth/login`):
   ```typescript
   // Verify credentials
   const isValid = await bcrypt.compare(password, owner.password_hash);
   
   // Create JWT
   const token = await createSession({ ownerId, cafeId, username });
   
   // Set httpOnly cookie
   await setSessionCookie(token);
   ```

2. **Protected Route** (`/api/owner/*`):
   ```typescript
   // Verify session
   const session = await getSession();
   
   if (!session) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   
   // Use session data
   const cafeId = session.cafeId;
   ```

3. **Logout** (`POST /api/auth/logout`):
   ```typescript
   await clearSession(); // Deletes cookie
   ```

## Adding New Features

### Example: Add a Rating System

1. **Update Database Schema**

```sql
-- lib/db.ts
db.exec(`
  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cafe_id INTEGER NOT NULL,
    user_email TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
  )
`);
```

2. **Add TypeScript Interface**

```typescript
// lib/types.ts
export interface Rating {
  id: number;
  cafe_id: number;
  user_email: string;
  rating: number;
  comment: string | null;
  created_at: string;
}
```

3. **Create API Endpoint**

```typescript
// app/api/cafes/[id]/ratings/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ratings = db.prepare('SELECT * FROM ratings WHERE cafe_id = ?').all(id);
  return NextResponse.json(ratings);
}

export async function POST(request: Request) {
  const { cafe_id, user_email, rating, comment } = await request.json();
  
  const result = db.prepare(`
    INSERT INTO ratings (cafe_id, user_email, rating, comment)
    VALUES (?, ?, ?, ?)
  `).run(cafe_id, user_email, rating, comment);
  
  return NextResponse.json({ id: result.lastInsertRowid });
}
```

4. **Update UI Component**

```typescript
// components/cafe-ratings.tsx
'use client';

export function CafeRatings({ cafeId }: { cafeId: number }) {
  const [ratings, setRatings] = useState([]);
  
  useEffect(() => {
    fetch(`/api/cafes/${cafeId}/ratings`)
      .then(res => res.json())
      .then(setRatings);
  }, [cafeId]);
  
  return (
    <div>
      {ratings.map(rating => (
        <div key={rating.id}>
          {'⭐'.repeat(rating.rating)}
          <p>{rating.comment}</p>
        </div>
      ))}
    </div>
  );
}
```

5. **Add to Café Page**

```typescript
// app/cafe/[id]/page.tsx
import { CafeRatings } from '@/components/cafe-ratings';

// In the component:
<CafeRatings cafeId={cafe.id} />
```

## Common Tasks

### Add a New Page

1. Create file in `app/` folder
2. Export a default component
3. Add link in navigation

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return <div>About Us</div>;
}

// components/navigation.tsx
const links = [
  // ... existing links
  { href: '/about', label: 'About' },
];
```

### Add a New API Endpoint

1. Create route file
2. Export HTTP method functions
3. Use in frontend

```typescript
// app/api/stats/route.ts
export async function GET() {
  const stats = { cafes: 3, bookings: 42 };
  return NextResponse.json(stats);
}

// In component:
const res = await fetch('/api/stats');
const stats = await res.json();
```

### Update Database Schema

1. Modify `lib/db.ts` for new tables
2. Update `scripts/setup-db.js` for seeds
3. Delete old database: `rm gaming-cafes.db`
4. Re-run setup: `npm run setup`

**Note**: In production, use migrations instead of deleting!

## Debugging Tips

### Database Issues

```javascript
// Enable SQL logging
db.pragma('journal_mode = WAL');
db.function('debug', (val) => {
  console.log('SQL Debug:', val);
  return val;
});
```

### API Issues

```typescript
// Add logging in API routes
console.log('Request body:', body);
console.log('Database result:', result);
```

### Frontend Issues

```typescript
// Use browser console
console.log('State:', state);
console.error('Error:', error);

// React DevTools in browser
```

### Check Database Contents

```bash
# Open SQLite CLI
sqlite3 gaming-cafes.db

# List tables
.tables

# Query data
SELECT * FROM cafes;

# Exit
.quit
```

## Testing Locally

### Manual Testing Checklist

- [ ] Home page loads with 3 cafés
- [ ] Clicking café shows detail page
- [ ] Booking form submits successfully
- [ ] My Bookings shows created booking
- [ ] Owner login works
- [ ] Owner dashboard shows bookings
- [ ] Slot toggle works
- [ ] Café editor saves changes
- [ ] Logout works

### Test Data

Use these for testing:

**Owner Credentials:**
```
Username: gamezone_owner
Password: password123
```

**Test Booking:**
```
Name: John Doe
Email: john@example.com
Gaming Handle: ProGamer123
```

## Code Style Guidelines

### TypeScript

```typescript
// ✅ Use interfaces
interface User {
  id: number;
  name: string;
}

// ❌ Avoid types for objects
type User = {
  id: number;
  name: string;
};

// ✅ Use function keyword
function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Descriptive variable names
const isLoading = true;
const hasError = false;
```

### React

```typescript
// ✅ Functional components
function BookingForm({ cafeId }: Props) {
  return <form>...</form>;
}

// ✅ Named exports
export function BookingForm() { }

// ❌ Avoid default exports for components
export default function BookingForm() { }
```

### CSS

```typescript
// ✅ Use Tailwind utilities
<div className="flex items-center justify-between p-4 bg-white rounded-lg">

// ✅ Use custom classes from globals.css
<button className="btn btn-primary">

// ❌ Avoid inline styles
<div style={{ padding: '16px' }}>
```

## Performance Tips

1. **Use Server Components when possible**
   - No need for 'use client' if no interactivity
   - Reduces JavaScript bundle size

2. **Minimize useEffect**
   - Fetch data in Server Components instead
   - Only use for client-side updates

3. **Optimize Database Queries**
   - Use indexes on foreign keys
   - Avoid N+1 queries with JOINs
   - Limit results when appropriate

4. **Cache Static Data**
   - Café listings can be cached
   - Use `revalidate` in fetch options

## Troubleshooting

### Error: Database locked

SQLite allows only one writer at a time. Solutions:
- Use WAL mode (already enabled)
- Close database connections properly
- Avoid long-running transactions

### Error: Cannot find module

```bash
npm install
```

### Error: Port already in use

```bash
# Find process
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### TypeScript Errors

```bash
# Check types
npx tsc --noEmit

# Clear cache
rm -rf .next
npm run dev
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [SQLite Docs](https://www.sqlite.org/docs.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Need Help?

1. Check console errors (browser & terminal)
2. Verify database setup (`npm run verify`)
3. Read error messages carefully
4. Check API responses in Network tab
5. Review this guide and README.md

---

Happy coding! 🚀

