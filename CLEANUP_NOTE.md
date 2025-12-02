# Cleanup Note

## Old Files to Remove (Optional)

The following folders are from a previous implementation and are NOT used by the current Next.js application:

```
src/           - Old Vite/React components (not used)
server/        - Old Express server files (not used)
```

The new application uses:
- `app/` - Next.js App Router pages and API routes
- `components/` - React components
- `lib/` - Utilities and database
- `scripts/` - Setup scripts

## To Clean Up (Optional)

If you want to remove old files:

**Windows PowerShell:**
```powershell
Remove-Item -Recurse -Force src
Remove-Item -Recurse -Force server
```

**Mac/Linux:**
```bash
rm -rf src
rm -rf server
```

## Important

**DO NOT DELETE** these folders:
- ✅ `app/` (current Next.js application)
- ✅ `components/` (current React components)
- ✅ `lib/` (database and utilities)
- ✅ `scripts/` (database setup)
- ✅ `node_modules/` (dependencies)

The application will work fine with or without removing the old folders. They are simply ignored by Next.js.

## Current Project Structure

The active codebase is:

```
XPerience/
├── app/              ← ACTIVE (Next.js pages & API)
├── components/       ← ACTIVE (React components)
├── lib/             ← ACTIVE (utilities)
├── scripts/         ← ACTIVE (setup scripts)
├── node_modules/    ← ACTIVE (dependencies)
├── package.json     ← ACTIVE (config)
├── tsconfig.json    ← ACTIVE (TypeScript)
├── tailwind.config.ts ← ACTIVE (Tailwind)
├── next.config.js   ← ACTIVE (Next.js)
├── *.md            ← Documentation
└── gaming-cafes.db  ← Database (created on setup)
```

Inactive folders (can be deleted):
```
├── src/             ← OLD (Vite/React)
└── server/          ← OLD (Express)
```

## No Action Required

The application works perfectly as-is. The old folders are harmless and ignored by Next.js.

Only clean up if you want a tidier project directory.

