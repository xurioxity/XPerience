# Final Setup & Testing Checklist

Complete checklist to ensure everything is working perfectly.

## ✅ Pre-Installation Checklist

### System Requirements

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Windows: Visual Studio Build Tools installed (for better-sqlite3)
- [ ] At least 500 MB free disk space
- [ ] Port 3000 available

### Verify Node.js Installation

```bash
node --version
# Should show: v18.x.x or higher

npm --version
# Should show: 9.x.x or higher
```

## 📦 Installation Steps

### Step 1: Navigate to Project

```bash
cd C:\Users\Gaurav\OneDrive\Desktop\XPerience
```

✅ Verify you're in the right directory:
```bash
dir package.json
# Should show package.json exists
```

### Step 2: Install Dependencies

```bash
npm install
```

✅ Success indicators:
- No red error messages
- "added XXX packages" message
- `node_modules/` folder created

❌ If errors occur:
- Windows: Install build tools first
- See [WINDOWS_SETUP.md](WINDOWS_SETUP.md)

### Step 3: Initialize Database

```bash
npm run setup
```

✅ Expected output:
```
Setting up database...
Tables created successfully
Seeding sample data...
Cafes created
Games added
Time slots created
Owner accounts created

Sample login credentials:
Username: gamezone_owner, Password: password123
Username: cyberknights_owner, Password: password123
Username: pixelparadise_owner, Password: password123

Database setup completed successfully!
```

✅ Verify:
- [ ] No error messages
- [ ] File `gaming-cafes.db` created in project root
- [ ] Sample credentials displayed

### Step 4: Verify Setup

```bash
npm run verify
```

✅ Expected output:
```
🔍 Verifying setup...

✅ Database file exists
✅ Database tables:
   ✓ cafes
   ✓ games
   ✓ time_slots
   ✓ bookings
   ✓ owners

✅ Sample data:
   • 3 cafés
   • 147 time slots
   • 3 owner accounts

✅ Setup verified successfully!

🚀 Ready to start:
   npm run dev

   Then visit: http://localhost:3000
```

### Step 5: Start Development Server

```bash
npm run dev
```

✅ Expected output:
```
  ▲ Next.js 14.2.23
  - Local:        http://localhost:3000

✓ Ready in Xs
```

✅ Verify:
- [ ] Server starts without errors
- [ ] Shows "Ready in X seconds"
- [ ] No compilation errors

## 🧪 Testing Checklist

### Test 1: Home Page

**Action**: Open http://localhost:3000

✅ Expected:
- [ ] Page loads successfully
- [ ] Shows "Bangalore Gaming Cafés" heading
- [ ] Displays 3 café cards
- [ ] Each card shows:
  - [ ] Café name
  - [ ] Address
  - [ ] Photo
  - [ ] PC count
  - [ ] GPU specs
  - [ ] "View Details" button

### Test 2: Café Profile Page

**Action**: Click on "GameZone Arena"

✅ Expected:
- [ ] Navigates to `/cafe/1`
- [ ] Shows café photo
- [ ] Displays hardware specs
- [ ] Shows list of games (13 games)
- [ ] Booking form visible on right side
- [ ] Time slots displayed by date

### Test 3: View Available Slots

**Action**: Scroll to booking form

✅ Expected:
- [ ] Shows "Select Time Slot" section
- [ ] Displays dates (Today, Tomorrow, etc.)
- [ ] Shows time slots (10:00-12:00, etc.)
- [ ] Each slot shows remaining PCs
- [ ] Slots are clickable

### Test 4: Make a Booking

**Action**: 
1. Select a time slot (click on it)
2. Fill in form:
   - Name: John Doe
   - Email: john@example.com
   - Gaming Handle: ProGamer123
   - PCs: 1
3. Click "Confirm Booking"

✅ Expected:
- [ ] Selected slot highlights in blue
- [ ] Form accepts input
- [ ] Shows "Booking..." while submitting
- [ ] Success message appears
- [ ] Form resets
- [ ] Slots refresh with updated capacity

### Test 5: View Your Bookings

**Action**: 
1. Click "My Bookings" in navigation
2. Enter email: john@example.com
3. Click "Search"

✅ Expected:
- [ ] Page loads at `/my-bookings`
- [ ] Email form visible
- [ ] Shows "Searching..." while loading
- [ ] Displays booking in "Upcoming Bookings"
- [ ] Shows:
  - [ ] Café name
  - [ ] Date and time
  - [ ] Your name and gaming handle
  - [ ] Number of PCs
  - [ ] "confirmed" status

### Test 6: Owner Login

**Action**:
1. Click "Owner Dashboard" in navigation
2. Enter credentials:
   - Username: gamezone_owner
   - Password: password123
3. Click "Login"

✅ Expected:
- [ ] Page loads at `/owner`
- [ ] Login form visible
- [ ] Demo credentials shown
- [ ] Shows "Logging in..." while submitting
- [ ] Dashboard loads after successful login

### Test 7: Owner Dashboard - Bookings

**Action**: After login, view Bookings tab

✅ Expected:
- [ ] Shows "Owner Dashboard" heading
- [ ] Username displayed: "Welcome back, gamezone_owner"
- [ ] "Bookings" tab active
- [ ] Displays booking created in Test 4
- [ ] Shows customer details:
  - [ ] Name: John Doe
  - [ ] Email: john@example.com
  - [ ] Gaming Handle: ProGamer123
  - [ ] Date and time
  - [ ] Number of PCs

### Test 8: Owner Dashboard - Slots

**Action**: Click "Time Slots" tab

✅ Expected:
- [ ] Tab switches to "Time Slots"
- [ ] Shows slots grouped by date
- [ ] Each slot displays:
  - [ ] Time range
  - [ ] Capacity (booked/total)
  - [ ] Booking count
  - [ ] Status (Available/Unavailable)
  - [ ] Enable/Disable button

**Action**: Click "Disable" on a slot

✅ Expected:
- [ ] Slot status changes to "Unavailable"
- [ ] Button changes to "Enable"
- [ ] Updates in real-time

**Action**: Click "Enable" to re-enable

✅ Expected:
- [ ] Slot status changes back to "Available"
- [ ] Button changes to "Disable"

### Test 9: Owner Dashboard - Café Profile

**Action**: Click "Café Profile" tab

✅ Expected:
- [ ] Tab switches to "Café Profile"
- [ ] Form loads with current café data:
  - [ ] Name: GameZone Arena
  - [ ] Address: MG Road, Bangalore - 560001
  - [ ] Number of PCs: 25
  - [ ] GPU: NVIDIA RTX 4080
  - [ ] CPU: Intel Core i9-13900K
  - [ ] RAM: 32GB DDR5

**Action**: 
1. Change number of PCs to 30
2. Click "Save Changes"

✅ Expected:
- [ ] Shows "Saving..." while submitting
- [ ] Success message appears
- [ ] Changes are saved

### Test 10: Owner Logout

**Action**: Click "Logout" button

✅ Expected:
- [ ] Redirects to home page
- [ ] Session cleared
- [ ] Visiting `/owner` shows login form again

### Test 11: Navigation

**Action**: Click through all navigation links

✅ Expected:
- [ ] "Home" → Goes to `/`
- [ ] "My Bookings" → Goes to `/my-bookings`
- [ ] "Owner Dashboard" → Goes to `/owner`
- [ ] Active link is highlighted
- [ ] Navigation works from any page

### Test 12: Responsive Design

**Action**: Resize browser window

✅ Expected:
- [ ] Layout adapts to smaller screens
- [ ] All content remains accessible
- [ ] No horizontal scrolling
- [ ] Buttons remain clickable
- [ ] Forms work on mobile sizes

## 🔍 Database Verification

### Manual Database Check (Optional)

If you want to verify the database directly:

**Install DB Browser:**
1. Download from https://sqlitebrowser.org/
2. Open `gaming-cafes.db`

✅ Verify tables:
- [ ] cafes (3 rows)
- [ ] games (39 rows - 13 games × 3 cafés)
- [ ] time_slots (147 rows - 7 slots × 7 days × 3 cafés)
- [ ] bookings (varies based on tests)
- [ ] owners (3 rows)

## 🐛 Troubleshooting

### Issue: npm install fails

**Try:**
```bash
npm cache clean --force
npm install
```

### Issue: Database not created

**Try:**
```bash
del gaming-cafes.db
npm run setup
```

### Issue: Port 3000 in use

**Try:**
```bash
# Find process
netstat -ano | findstr :3000

# Kill it
taskkill /PID <PID> /F
```

### Issue: Page shows 404

**Check:**
- [ ] Development server is running
- [ ] No errors in terminal
- [ ] Correct URL: http://localhost:3000

### Issue: API errors

**Check:**
- [ ] Database exists (`dir gaming-cafes.db`)
- [ ] Setup completed (`npm run verify`)
- [ ] Check browser console (F12)

## ✅ Final Verification

All tests passing? Check these final items:

- [ ] All 3 cafés visible on home page
- [ ] Can click into café details
- [ ] Can make a booking
- [ ] Booking appears in "My Bookings"
- [ ] Can login as owner
- [ ] Can see booking in owner dashboard
- [ ] Can toggle slot availability
- [ ] Can edit café profile
- [ ] Can logout
- [ ] Navigation works
- [ ] No console errors (F12)

## 🎉 Success Criteria

**You're all set if:**

✅ Home page loads with 3 cafés
✅ Booking system works end-to-end
✅ Owner dashboard accessible
✅ All features functional
✅ No errors in console or terminal

## 📊 Test Summary

| Test | Description | Status |
|------|-------------|--------|
| 1 | Home page loads | ⬜ |
| 2 | Café profile displays | ⬜ |
| 3 | Slots visible | ⬜ |
| 4 | Booking works | ⬜ |
| 5 | View bookings works | ⬜ |
| 6 | Owner login works | ⬜ |
| 7 | View bookings (owner) | ⬜ |
| 8 | Manage slots works | ⬜ |
| 9 | Edit profile works | ⬜ |
| 10 | Logout works | ⬜ |
| 11 | Navigation works | ⬜ |
| 12 | Responsive design | ⬜ |

**All tests passed?** 🎉 **You're ready to use the platform!**

## 📞 Need Help?

If any test fails:

1. Check terminal for error messages
2. Check browser console (F12)
3. Review [WINDOWS_SETUP.md](WINDOWS_SETUP.md)
4. Check [DEVELOPMENT.md](DEVELOPMENT.md) - Troubleshooting
5. Run `npm run verify` to check setup

---

**Happy testing! 🧪**

