# Vercel Deployment

## Project Settings
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Root Directory: `StoreFlow-AIME` when this repository contains the folder as a subdirectory.
- Node.js: 22.x

## Important
This project intentionally does not use the legacy `builds` property in `vercel.json`.
If Vercel reports `Due to builds existing in your configuration file`, the deployment is reading a different/older `vercel.json` or the Vercel Root Directory points at a different folder.

## npm install scripts
`esbuild` is explicitly approved because Vite requires its install-time binary setup.
