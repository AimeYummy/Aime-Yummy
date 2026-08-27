# Vercel Deployment

## Important
This package is intentionally flattened so `package.json` and `vercel.json` are at the project root. Do not set a nested Root Directory.

### Vercel settings
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Node.js: 22.x

### Why this version is different
- No `builds` property exists anywhere in the project.
- npm is pinned through `packageManager` to npm 10.9.3, avoiding npm 11's install-script review warning.
- `allowScripts` and `.npmrc` overrides were removed because they are not needed with npm 10.
- Vite chunk warning threshold is 1000 KB.
- API functions remain under `/api`.

### If the Vercel log still says `builds` exists
That message is coming from a different `vercel.json` than this project. Check Vercel Project Settings > General > Root Directory and make sure it points to the directory containing this `vercel.json`, or use this flattened package as the repository root. Then redeploy with cache disabled.
