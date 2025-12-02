# Windows Setup Guide

Special instructions for setting up this project on Windows.

## Prerequisites

### 1. Install Node.js

Download and install Node.js 18+ from [nodejs.org](https://nodejs.org/)

Verify installation:
```powershell
node --version
npm --version
```

### 2. Install Build Tools (Required for better-sqlite3)

Open **PowerShell as Administrator** and run:

```powershell
npm install --global windows-build-tools
```

Or install Visual Studio Build Tools manually:
- Download from [Visual Studio](https://visualstudio.microsoft.com/downloads/)
- Select "Desktop development with C++" workload

## Setup Steps

### 1. Open PowerShell or Command Prompt

Navigate to the project folder:
```powershell
cd C:\Users\Gaurav\OneDrive\Desktop\XPerience
```

### 2. Install Dependencies

```powershell
npm install
```

**If you encounter errors with better-sqlite3:**

Try these solutions in order:

**Solution 1: Use prebuilt binaries**
```powershell
npm install better-sqlite3 --build-from-source=false
```

**Solution 2: Clear cache and reinstall**
```powershell
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
```

**Solution 3: Install specific version**
```powershell
npm install better-sqlite3@9.4.0
```

### 3. Initialize Database

```powershell
npm run setup
```

You should see:
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
...
```

### 4. Verify Setup

```powershell
npm run verify
```

### 5. Start Development Server

```powershell
npm run dev
```

Visit: http://localhost:3000

## Common Windows Issues

### Issue 1: PowerShell Execution Policy

**Error:** "cannot be loaded because running scripts is disabled"

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue 2: Python Not Found

**Error:** "Can't find Python executable"

**Solution:**
Install Python from [python.org](https://www.python.org/downloads/)

Or use Windows Store version:
```powershell
python --version
```

### Issue 3: MSBuild Not Found

**Error:** "MSBuild.exe not found"

**Solution:**
Install Visual Studio Build Tools (see Prerequisites above)

### Issue 4: Port Already in Use

**Error:** "Port 3000 is already in use"

**Solution:**

Find and kill the process:
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

Or use a different port:
```powershell
$env:PORT=3001; npm run dev
```

### Issue 5: Database Locked

**Error:** "database is locked"

**Solution:**
```powershell
# Close all running dev servers
# Delete database and recreate
Remove-Item gaming-cafes.db
npm run setup
```

### Issue 6: Permission Denied

**Error:** "EACCES: permission denied"

**Solution:**
Run PowerShell as Administrator or change folder permissions

## File Paths on Windows

The database is created at:
```
C:\Users\Gaurav\OneDrive\Desktop\XPerience\gaming-cafes.db
```

To view the database:
1. Install [DB Browser for SQLite](https://sqlitebrowser.org/)
2. Open `gaming-cafes.db`

## Windows-Specific Tips

### 1. Use PowerShell (Recommended)

PowerShell is better than Command Prompt for Node.js development.

### 2. Enable Developer Mode

Go to: Settings → Update & Security → For developers → Developer mode

This helps with symlinks and permissions.

### 3. Antivirus Exclusions

Add project folder to antivirus exclusions for better performance:
- Windows Defender → Virus & threat protection → Exclusions
- Add folder: `C:\Users\Gaurav\OneDrive\Desktop\XPerience`

### 4. Windows Terminal (Optional but Recommended)

Install Windows Terminal from Microsoft Store for a better terminal experience.

## Testing on Windows

Everything should work the same as on Mac/Linux:

```powershell
# Start server
npm run dev

# Open browser
start http://localhost:3000

# Owner login
# Username: gamezone_owner
# Password: password123
```

## Building for Production

```powershell
# Build
npm run build

# Start production server
npm run start
```

## Environment Variables (Optional)

Create `.env.local` file:
```
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## Troubleshooting Checklist

- [ ] Node.js 18+ installed
- [ ] Visual Studio Build Tools installed
- [ ] npm install completed without errors
- [ ] Database setup successful
- [ ] Dev server starts on port 3000
- [ ] Browser opens http://localhost:3000
- [ ] Home page shows 3 cafés
- [ ] Can create a booking
- [ ] Owner login works

## Getting Help

If you're still having issues:

1. **Check error messages carefully**
   - Copy the full error message
   - Search online for solutions

2. **Verify all prerequisites**
   - Node.js version: `node --version`
   - Python: `python --version`
   - Build tools installed

3. **Start fresh**
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item gaming-cafes.db
   npm install
   npm run setup
   npm run dev
   ```

4. **Check Windows Firewall**
   - Allow Node.js through firewall
   - Allow port 3000

5. **Restart Computer**
   - Sometimes Windows needs a restart after installing build tools

## Success!

If you see this in your browser:

```
Bangalore Gaming Cafés
Find and book your perfect gaming session at top cafés across Bangalore

[3 café cards displayed]
```

**You're all set!** 🎉

## Quick Commands Reference

```powershell
# Setup
npm install
npm run setup

# Development
npm run dev
npm run verify

# Build
npm run build
npm run start

# Maintenance
npm run lint
```

## Windows Performance Tips

1. **Exclude from OneDrive sync** (if project is in OneDrive):
   - Right-click folder → Free up space
   - Or move project outside OneDrive

2. **Use SSD**:
   - Move project to SSD if on HDD

3. **Close unnecessary programs**:
   - Node.js can be memory-intensive

4. **Increase PowerShell buffer**:
   - Right-click title bar → Properties
   - Increase screen buffer size

## Working with Git on Windows

If using Git:

```powershell
# Ignore database file
echo "*.db" >> .gitignore

# Ignore node_modules (already in .gitignore)
# Commit and push
git add .
git commit -m "Initial commit"
git push
```

## VSCode on Windows

Recommended extensions:
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- SQLite Viewer
- Prettier
- ESLint

---

**Happy coding on Windows!** 💻

