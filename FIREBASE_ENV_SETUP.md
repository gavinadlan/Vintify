# Cara Mendapatkan Firebase Credentials

## Langkah-langkah:

### 1. Buka Firebase Console
- Pergi ke [Firebase Console](https://console.firebase.google.com/)
- Login dengan akun Google Anda
- Pilih project yang sudah ada, atau buat project baru

### 2. Dapatkan Web App Credentials
1. Klik ikon **⚙️ Settings** (gear icon) di sidebar kiri
2. Pilih **Project settings**
3. Scroll ke bawah ke bagian **"Your apps"**
4. Jika belum ada Web app, klik **"</>" (Web)** untuk menambahkan
5. Jika sudah ada, klik pada Web app yang ada

### 3. Copy Credentials
Setelah Web app dibuat/terbuka, Anda akan melihat konfigurasi seperti ini:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**Yang Anda butuhkan:**
- `apiKey` → `PUBLIC_FIREBASE_API_KEY`
- `projectId` → `PUBLIC_FIREBASE_PROJECT_ID`
- `appId` → `PUBLIC_FIREBASE_APP_ID`

### 4. Update File .env
Buka file `.env` di root project dan ganti nilai-nilai berikut:

```env
PUBLIC_FIREBASE_API_KEY=AIzaSy... (dari apiKey)
PUBLIC_FIREBASE_PROJECT_ID=your-project-id (dari projectId)
PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef (dari appId)
```

### 5. Restart Server
Setelah mengupdate `.env`, restart development server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

## Catatan Penting

1. **PUBLIC_** prefix penting! Di SvelteKit, environment variables yang bisa diakses di client-side harus diawali dengan `PUBLIC_`

2. **Jangan commit .env ke Git** - File ini sudah ada di `.gitignore`

3. **Jika project baru**, pastikan:
   - Authentication > Sign-in method: Enable Email/Password
   - Firestore Database: Create database
   - Storage: Get started

## Troubleshooting

### Error: "Firebase is not configured"
- Pastikan semua 3 environment variables sudah diisi
- Pastikan menggunakan prefix `PUBLIC_`
- Restart server setelah mengubah `.env`

### Error: "Cannot login"
- Pastikan Firebase Authentication sudah di-enable
- Pastikan Email/Password sign-in method sudah diaktifkan
- Cek apakah email/password yang digunakan sudah terdaftar di Firebase Authentication > Users

