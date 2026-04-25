---
description: Run the development server for Peteye (Peteye project)
---

## Steps to run the dev server

1. Open a terminal in the project root directory:
   ```
   cd c:\Users\kjt\Desktop\EXE2\Peteye
   ```

// turbo
2. Install dependencies (if not already installed):
   ```
   npm install
   ```

// turbo
3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Notes
- The app uses Vite + React + TypeScript
- The LandingPage is at `/` (public, no auth needed)
- The HomePage is at `/home` (accessible after login/register)
- Login at `/login`, Register at `/register`
- Use the "Demo — Vào HomePage ngay" button on Login/Register pages to skip form validation and go directly to the HomePage

