# Setup Spotify API Integration

Panduan untuk mengintegrasikan Spotify Web API ke aplikasi Vintify.

## Langkah-langkah Setup

### 1. Dapatkan Spotify Credentials

1. Buka [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Login dengan akun Spotify Anda
3. Klik **"Create app"**
4. Isi form:
   - **App name**: `Vintify`
   - **App description**: Deskripsi aplikasi Anda
   - **Website**: `http://localhost:5000` (untuk development)
   - **Redirect URIs**: `http://127.0.0.1:5000/api/spotify/callback`
   - **Which API/SDKs**: Centang **Web API**
5. Centang checkbox untuk menyetujui Terms of Service
6. Klik **"Save"**

### 2. Dapatkan Client ID dan Client Secret

Setelah app dibuat:
1. Klik pada app yang baru dibuat
2. Anda akan melihat **Client ID** dan **Client Secret**
3. Klik **"View client secret"** untuk melihat Client Secret
4. **Simpan kedua nilai ini dengan aman!**

### 3. Setup Environment Variables

Buat file `.env` di root project (sama level dengan `package.json`):

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5000/api/spotify/callback
```

**PENTING:**
- Jangan commit file `.env` ke Git (sudah ada di `.gitignore`)
- Jangan share Client Secret ke siapa pun
- Untuk production, gunakan environment variables di hosting platform Anda

### 4. Restart Development Server

Setelah menambahkan environment variables, restart server development:

```bash
npm run dev
```

## Fitur yang Tersedia

### 1. Search dari Spotify
- Buka halaman **Search**
- Klik tab **"Spotify"**
- Ketik query untuk mencari lagu
- Hasil akan muncul dari Spotify

### 2. Tambah Lagu ke Library
- Setelah mencari di Spotify
- Klik tombol **"+"** (hijau) pada track yang ingin ditambahkan
- Lagu akan ditambahkan ke library Anda
- Lagu dari Spotify akan memiliki badge "From Spotify"

### 3. Upload Lagu Sendiri
- Fitur upload tetap berfungsi seperti biasa
- Lagu yang di-upload akan memiliki `sourceType: 'upload'`
- Lagu dari Spotify akan memiliki `sourceType: 'external'`

## Troubleshooting

### Error: "Spotify API not configured"
- Pastikan file `.env` sudah dibuat
- Pastikan `SPOTIFY_CLIENT_ID` dan `SPOTIFY_CLIENT_SECRET` sudah diisi
- Restart development server setelah menambahkan environment variables

### Error: "Failed to search Spotify"
- Cek apakah credentials sudah benar
- Pastikan internet connection aktif
- Cek console untuk error details

### Redirect URI Error
- Pastikan redirect URI di Spotify Dashboard sama persis dengan yang di `.env`
- Gunakan `http://127.0.0.1:5000` bukan `http://localhost:5000`

## Catatan Penting

1. **Client Credentials Flow**: Aplikasi ini menggunakan Client Credentials Flow yang tidak memerlukan user login ke Spotify. Ini cocok untuk search dan fetch data.

2. **Preview URLs**: Beberapa track dari Spotify memiliki `preview_url` (30 detik preview). Jika tidak ada, akan menggunakan Spotify external URL.

3. **Rate Limits**: Spotify API memiliki rate limits. Jangan terlalu sering melakukan request.

4. **Production**: Untuk production, pastikan:
   - Menggunakan HTTPS untuk redirect URI
   - Menyimpan credentials dengan aman
   - Menggunakan environment variables di hosting platform

## Referensi

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

