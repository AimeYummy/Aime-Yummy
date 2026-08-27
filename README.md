# AIME YUMMY + StoreFlow — Unified Project

Project ini sudah digabung menjadi **satu folder, satu frontend React/Vite, dan satu backend serverless `/api`**.

Arsitektur akhirnya:

```text
Website pelanggan (/)
      │
      ├── Menu dari Supabase
      ├── Keranjang
      ├── Checkout & pembayaran
      └── Tombol Sign In
              │
              ▼
        /admin/login
              │
        Supabase Auth
              │
              ▼
           /admin
      ┌───────┼───────────────────┐
      │       │       │           │
   Menu    Stok     Meja      Penjualan
      │       │       │           │
      └───────┴───────┴───────────┘
                  │
              Supabase
```

## Yang sudah digabung

StoreFlow yang sebelumnya menggunakan **Fenrir + Jinja + MongoDB** sudah dipindahkan ke React project AIME YUMMY.

Backend MongoDB, model Motor/PyMongo, session login lama, template Jinja, dan modul Python StoreFlow sudah dihapus dari project final.

Sekarang menu, stok, order, laporan, dan login admin menggunakan Supabase sebagai sumber data bersama.

## Halaman

### Website pelanggan

- `/` — Halaman utama AIME YUMMY
- `/variant/:id` — Pilih varian
- `/order` — Keranjang/order
- `/payment` — Pembayaran
- `/profile` — Profil/kontak
- `/admin/login` — Sign In admin

### Dashboard admin

- `/admin` — Dashboard utama
- `/admin/menu` — Tambah, edit, nonaktifkan menu
- `/admin/stock` — Input stok mika → PCS dan laporan stok
- `/admin/tables` — Tambah/edit/nonaktifkan meja dan penjualan per meja
- `/admin/sales` — Riwayat transaksi + penjualan manual
- `/admin/performance` — Pendapatan, HPP, profit, transaksi, unit terjual
- `/admin/export` — Tampilkan laporan, export spreadsheet `.xls`, dan print/PDF melalui browser

`/admin/dashboard` tetap diarahkan ke `/admin` untuk kompatibilitas URL lama.

## Sinkronisasi data

### Menu

Saat admin menambah atau mengubah menu di `/admin/menu`, data masuk ke tabel `menu_items` Supabase.

Website pelanggan membaca tabel yang sama melalui `/api/menu-list`.

Jadi:

```text
Admin Tambah Menu
      ↓
Supabase menu_items
      ↓
Website pelanggan otomatis membaca menu yang sama
```

### Stok

Input stok di `/admin/stock`:

```text
Jumlah Mika × Isi per Mika = Total PCS
```

Setiap stok masuk dicatat ke `stock_movements` dan kolom `menu_items.stock` diperbarui.

Ketika order dikonfirmasi menjadi `paid`, stok dikurangi otomatis dan pergerakan `OUT` dicatat.

Transaksi manual admin juga langsung mengurangi stok.

### Transaksi

Order pelanggan disimpan di tabel `orders` yang sudah digunakan oleh flow pembayaran AIME YUMMY.

Dashboard StoreFlow tidak memakai database transaksi sendiri. Dashboard membaca `orders` yang sama.

Status yang dipakai:

- `pending`
- `paid`
- `processing`
- `completed`

Status `paid`, `processing`, dan `completed` dihitung sebagai transaksi yang sudah terjual.

## Supabase setup

1. Buat project Supabase.
2. Masuk ke **SQL Editor**.
3. Jalankan migration yang sudah ada di folder `supabase/migrations/` secara berurutan.
4. Pastikan migration `20260828_storeflow_unified.sql` ikut dijalankan setelah migration menu/order yang lama.
5. Pastikan bucket Storage `menu-images` tersedia jika upload gambar menu ingin digunakan.
6. Di **Authentication → Users**, buat user admin dengan email dan password.
7. Salin URL project dan anon key ke environment browser.
8. Salin service role key ke environment server. **Jangan pernah memasukkan service role key ke `VITE_*`.**

### Environment

Salin `.env.example` menjadi `.env.local` untuk pengembangan lokal, lalu isi:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

Tambahkan kembali variable payment/Telegram/WhatsApp dari deployment AIME YUMMY lama bila fitur tersebut memang digunakan.

## Instalasi lokal

Pastikan Node.js tersedia.

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
```

Preview hasil build:

```bash
npm run preview
```

## Deploy Vercel

Project sudah mempertahankan `api/**/*.js` sebagai serverless function dan Vite sebagai frontend.

Environment Variables yang perlu diatur di Vercel minimal:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Tambahkan variable gateway pembayaran dan Telegram sesuai konfigurasi aplikasi lama.

## Struktur folder final

```text
StoreFlow-AIME/
├── api/
│   ├── _menu-store.js
│   ├── _shared.js
│   ├── _store.js
│   ├── check-payment.js
│   ├── create-order.js
│   ├── create-qris.js
│   ├── menu-create.js
│   ├── menu-delete.js
│   ├── menu-list.js
│   ├── menu-update.js
│   ├── telegram-webhook.js
│   ├── orders/
│   │   └── [orderId]/
│   │       ├── confirm.js
│   │       └── status.js
│   └── admin/
│       ├── dashboard.js
│       ├── orders.js
│       ├── performance.js
│       ├── sales.js
│       ├── stock.js
│       └── tables.js
├── lib/
│   └── supabase.js
├── public/
├── src/
│   ├── components/
│   │   └── AdminLayout.jsx
│   ├── context/
│   ├── data/
│   ├── lib/
│   │   ├── adminApi.js
│   │   ├── menuApi.js
│   │   └── supabaseClient.js
│   ├── pages/
│   │   └── admin/
│   │       ├── AdminHomePage.jsx
│   │       ├── AdminMenuPage.jsx
│   │       ├── AdminPageShell.jsx
│   │       ├── AdminPerformancePage.jsx
│   │       ├── AdminSalesPage.jsx
│   │       ├── AdminStockPage.jsx
│   │       ├── AdminTablesPage.jsx
│   │       └── AdminExportPage.jsx
│   └── styles/
│       ├── base.css
│       └── admin.css
├── supabase/
│   └── migrations/
├── .env.example
├── index.html
├── package.json
├── vercel.json
└── README.md
```

## Keamanan

Frontend memakai `VITE_SUPABASE_ANON_KEY` dan Supabase Auth session.

Endpoint admin membaca token `Authorization: Bearer ...` dan memvalidasinya dengan Supabase Auth sebelum membaca/menulis data admin.

`SUPABASE_SERVICE_ROLE_KEY` hanya boleh berada di server environment.

## Catatan migrasi data MongoDB lama

Project final **tidak lagi menjalankan MongoDB**, tetapi data MongoDB lama tidak dapat dipindahkan secara otomatis dari ZIP karena koneksi/database production tidak ikut disertakan.

Jadi migration SQL final membuat struktur Supabase baru. Data menu/order yang memang sudah ada di Supabase AIME YUMMY tetap menggunakan tabel Supabase tersebut.

Untuk memindahkan data MongoDB lama secara historis, diperlukan export data MongoDB lama lalu dilakukan mapping ke:

- `menu_items`
- `stock_movements`
- `tables`
- `orders`

## Verifikasi yang dilakukan pada paket final

- Folder/model Python StoreFlow dihapus.
- Referensi MongoDB/Motor/PyMongo/Fenrir di project final sudah dibersihkan.
- Admin login lama berbasis password secret dihapus.
- Admin login diganti Supabase Auth email + password.
- Route admin baru berada dalam React project yang sama.
- Sintaks seluruh file `.js` tervalidasi dengan `node --check`.
- Seluruh file `.js/.jsx` divalidasi melalui TypeScript parser dan tidak ditemukan error syntax.

Catatan: build Vite tidak dapat dijalankan di environment ini karena dependency npm tidak tersedia secara lokal dan registry npm tidak dapat diakses dari runtime. Jalankan `npm install` lalu `npm run build` pada mesin/deployment yang memiliki akses npm.
