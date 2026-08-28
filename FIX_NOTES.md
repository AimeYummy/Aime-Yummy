# StoreFlow AIME — API/404 fix

## What was fixed

The application previously depended on many logical API URLs such as `/api/menu-create` and `/api/admin/menu` being matched by a filesystem catch-all function. That routing layer was the source of the persistent 404 seen from the Admin Menu page.

The project now uses **one physical Vercel Function**:

- `api/index.js`

All frontend API calls are sent directly to:

- `/api/index?path=menu-list`
- `/api/index?path=menu-create`
- `/api/index?path=menu-update`
- `/api/index?path=menu-delete`
- `/api/index?path=admin/menu`
- `/api/index?path=admin/dashboard`
- `/api/index?path=admin/stock`
- `/api/index?path=admin/tables`
- `/api/index?path=admin/sales`
- `/api/index?path=admin/orders`
- `/api/index?path=orders/<id>/status`
- `/api/index?path=orders/<id>/fail`
- `/api/index?path=create-order`
- `/api/index?path=create-qris`
- `/api/index?path=check-payment`
- `/api/index?path=table-lookup`
- `/api/index?path=telegram-webhook`

`vercel.json` also keeps a compatibility rewrite from `/api/:path*` to `/api/index`, so older clients that still request the previous logical API paths can still reach the same function.

## Menu flow

Admin login obtains the Supabase session token -> Admin Menu sends authenticated POST -> `api/index.js` resolves `menu-create` -> server validates the request -> server writes to Supabase table `menu_items` using the service-role client -> the returned row is normalized -> Admin refreshes -> public menu refreshes from `/api/index?path=menu-list`.

Images are compressed in the browser before being sent to keep the server request within normal serverless request limits, then uploaded to the `menu-images` Supabase Storage bucket.

## Required Vercel environment variables

### Browser
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Server
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Other payment/Telegram variables should remain configured exactly as required by the existing project.

## Deployment

Deploy from the folder containing `package.json`, `vercel.json`, `api/`, `src/`, and `lib/`.

Do not move `api/index.js` into `src/`; Vercel functions are discovered from the root `api/` directory.

After deployment, hard refresh the browser so the newest frontend bundle is loaded.
