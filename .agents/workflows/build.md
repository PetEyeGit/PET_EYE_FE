---
description: Build the production bundle for Peteye (Peteye project)
---

## Steps to build for production

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
3. Build the production bundle:
   ```
   npm run build
   ```

4. The output is in the `dist/` folder. Preview with:
   ```
   npm run preview
   ```

## Notes
- TypeScript errors will fail the build. Fix any type errors before deploying.
- The build output is optimized and minified for production.

