# Bangalore Gaming Café Booking Platform

A fully functional MVP website for booking gaming sessions at cafés across Bangalore. Built with Next.js, TypeScript, and SQLite.

## Features

### 🏠 Home Page
- Browse all gaming cafés in Bangalore
- View basic information (name, address, PC count, GPU specs)
- Click to view detailed café profiles

### 🎮 Café Profile Page
- Detailed café information with photos
- Hardware specifications (GPUs, CPUs, RAM)
- Available games list
- Real-time slot availability calendar
- Booking form with user details (name, email, gaming handle)
- Prevents double-booking with live capacity tracking

### 📅 User Bookings Page
- View all your bookings by entering your email
- Separate sections for upcoming and past bookings
- Booking details including café, date, time, and status
- Stored email for quick access on return visits

### 👔 Owner Dashboard
- Secure login for café owners
- View all upcoming bookings with customer details
- Manage time slot availability (enable/disable slots)
- Edit café profile information and hardware specs
- Real-time booking statistics

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (RESTful API)
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT-based session tokens with httpOnly cookies
- **Password Hashing**: bcryptjs

## Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/route.ts    # Owner login
│   │   │   ├── logout/route.ts   # Owner logout
│   │   │   └── session/route.ts  # Get current session
│   │   ├── bookings/route.ts     # Booking management
│   │   ├── cafes/                # Café endpoints
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts      # Get/update café
│   │   │   │   └── slots/route.ts # Get café slots
│   │   │   └── route.ts          # List all cafés
│   │   └── owner/                # Owner-only endpoints
│   │       ├── bookings/route.ts # Owner's bookings
│   │       └── slots/route.ts    # Manage slots
│   ├── cafe/[id]/page.tsx        # Café detail page
│   ├── my-bookings/page.tsx      # User bookings page
│   ├── owner/page.tsx            # Owner dashboard page
│   ├── page.tsx                  # Home page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── booking-form.tsx          # Booking form with slot selection
│   ├── cafe-details.tsx          # Café information display
│   ├── cafe-editor.tsx           # Café profile editor
│   ├── navigation.tsx            # Navigation bar
│   ├── owner-dashboard.tsx       # Owner dashboard UI
│   └── owner-login.tsx           # Owner login form
├── lib/                          # Utility functions
│   ├── auth.ts                   # JWT authentication utilities
│   ├── db.ts                     # Database connection and init
│   └── types.ts                  # TypeScript interfaces
├── scripts/
│   └── setup-db.js               # Database setup and seed script
└── gaming-cafes.db               # SQLite database (created on setup)
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone or extract the project**
   ```bash
   cd XPerience
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database with sample data**
   ```bash
   npm run setup
   ```
   
   This will:
   - Create the SQLite database (`gaming-cafes.db`)
   - Set up all necessary tables
   - Seed 3 sample cafés with games and time slots
   - Create owner accounts

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Guide

### For Customers

1. **Browse Cafés**: Visit the home page to see all available gaming cafés
2. **View Details**: Click on any café to see full details and available slots
3. **Make a Booking**: 
   - Select an available time slot
   - Fill in your name, email, and gaming handle
   - Choose number of PCs needed
   - Submit the booking
4. **View Bookings**: Go to "My Bookings" and enter your email to see all your reservations

### For Café Owners

1. **Login**: Navigate to "Owner Dashboard" and use these credentials:
   ```
   Username: gamezone_owner
   Password: password123
   ```
   Other demo accounts:
   - `cyberknights_owner` / `password123`
   - `pixelparadise_owner` / `password123`

2. **View Bookings**: See all upcoming customer bookings with their details

3. **Manage Slots**: Toggle time slots as available/unavailable to control bookings

4. **Edit Profile**: Update café information and hardware specifications

## Database Schema

### Tables

**cafes**
- Store café information (name, address, hardware specs, photos)

**games**
- List of available games per café

**time_slots**
- Available booking slots with date, time, and capacity

**bookings**
- Customer reservations linked to slots and cafés

**owners**
- Café owner accounts with hashed passwords

## Key Features Explained

### Booking Logic

The booking system prevents double-booking by:
1. Tracking available PC capacity per slot
2. Counting confirmed bookings per slot
3. Calculating remaining capacity in real-time
4. Preventing bookings when capacity is reached

### Slot Management

Owners can:
- Enable/disable entire time slots
- View booking counts per slot
- See real-time capacity utilization

### Session Management

- JWT tokens stored in httpOnly cookies for security
- 7-day session expiration
- Automatic session validation on dashboard access

## API Endpoints

### Public Endpoints

- `GET /api/cafes` - List all cafés
- `GET /api/cafes/[id]` - Get café details
- `GET /api/cafes/[id]/slots` - Get available slots
- `POST /api/bookings` - Create booking
- `GET /api/bookings?email=...` - Get user bookings

### Owner Endpoints (Authentication Required)

- `POST /api/auth/login` - Owner login
- `POST /api/auth/logout` - Owner logout
- `GET /api/auth/session` - Get session
- `GET /api/owner/bookings` - Get café bookings
- `GET /api/owner/slots` - Get café slots
- `PUT /api/owner/slots` - Update slot availability
- `PUT /api/cafes/[id]` - Update café profile

## Sample Data

The database is seeded with:

**3 Gaming Cafés:**
1. GameZone Arena (MG Road) - 25 PCs, RTX 4080
2. Cyber Knights Gaming (Koramangala) - 30 PCs, RTX 4070 Ti
3. Pixel Paradise (Indiranagar) - 20 PCs, RTX 4060 Ti

**13 Popular Games:**
Valorant, CS:GO, Dota 2, League of Legends, Fortnite, Apex Legends, Overwatch 2, PUBG, GTA V, Minecraft, Call of Duty: Warzone, Rocket League, Rainbow Six Siege

**Time Slots:**
7 slots per day (10 AM - 12 AM) for the next 7 days

## Development Scripts

```bash
# Install dependencies
npm install

# Setup database with sample data
npm run setup

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Design Decisions

### Why Next.js?
- Server-side rendering for better SEO
- API routes eliminate need for separate backend
- React Server Components reduce client-side JavaScript
- Built-in routing and optimization

### Why SQLite?
- Zero configuration
- File-based database (no server needed)
- Perfect for local development and demos
- Easy to backup and share

### Why JWT + Cookies?
- Secure httpOnly cookies prevent XSS attacks
- Stateless authentication scales well
- 7-day sessions balance security and UX

### Desktop-First Design
- Gaming café users typically use desktops
- Complex dashboards benefit from larger screens
- Still responsive for mobile viewing

## Future Enhancements

Potential features for production:
- Payment integration
- Email notifications
- SMS reminders
- Rating and review system
- Loyalty points
- Multi-café booking
- Calendar sync
- Advanced analytics
- Photo upload for cafés
- Social login (Google, Discord)

## Troubleshooting

### Database not found
```bash
npm run setup
```

### Port 3000 already in use
```bash
# Kill the process or use a different port
PORT=3001 npm run dev
```

### Changes not reflecting
- Clear browser cache
- Delete `.next` folder and restart dev server

## License

This is a demo project created for educational purposes.

## Support

For issues or questions, please check:
1. All dependencies are installed (`npm install`)
2. Database is initialized (`npm run setup`)
3. Development server is running (`npm run dev`)
4. Browser console for error messages
