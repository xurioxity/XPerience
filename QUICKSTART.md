# Quick Start Guide

Get up and running with the Bangalore Gaming Café platform in 3 simple steps!

## 🚀 Installation & Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Initialize Database
```bash
npm run setup
```

This creates the database with 3 sample cafés and time slots.

### Step 3: Start the Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🎮 Demo Credentials

### Owner Login
Access the Owner Dashboard at `/owner`

```
Username: gamezone_owner
Password: password123
```

Other accounts:
- `cyberknights_owner` / `password123`
- `pixelparadise_owner` / `password123`

## 📖 Quick Tour

### 1. Browse Cafés (Home Page)
- See all 3 gaming cafés
- Click any café to view details

### 2. Make a Booking
- Select a café
- Choose an available time slot
- Fill in: Name, Email, Gaming Handle
- Submit booking

### 3. View Your Bookings
- Go to "My Bookings"
- Enter your email
- See all upcoming and past bookings

### 4. Owner Dashboard
- Login with demo credentials
- View all bookings
- Enable/disable time slots
- Edit café profile

## 🛠️ Key Features

✅ Real-time slot availability  
✅ Double-booking prevention  
✅ Owner authentication  
✅ Responsive design  
✅ Local data persistence  
✅ No external dependencies  

## 📁 Important Files

- `gaming-cafes.db` - SQLite database (created after setup)
- `scripts/setup-db.js` - Database initialization
- `lib/db.ts` - Database connection
- `lib/auth.ts` - Authentication logic

## 🐛 Troubleshooting

**Issue**: Database not found  
**Solution**: Run `npm run setup`

**Issue**: Port 3000 in use  
**Solution**: Run `PORT=3001 npm run dev`

**Issue**: Changes not showing  
**Solution**: Restart dev server

## 📚 Need More Details?

See the main [README.md](README.md) for:
- Complete API documentation
- Database schema
- Architecture details
- Future enhancements

---

**Happy Gaming! 🎮**

