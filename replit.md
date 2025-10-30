# Vintify - Music Streaming App

## Overview
Vintify is a music streaming application built with SvelteKit that allows users to upload, manage, and stream their own music. The app features user authentication, a full-featured music player, and a dark-themed interface with orange accents.

## Project Architecture

### Tech Stack
- **Frontend**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS
- **Audio Playback**: Howler.js
- **Backend/Storage**: Firebase (Authentication, Firestore, Storage)

### Directory Structure
```
src/
├── lib/
│   ├── components/
│   │   └── MusicPlayer.svelte    # Music player with controls
│   ├── firebase/
│   │   └── config.ts              # Firebase initialization
│   ├── stores/
│   │   ├── auth.ts                # User authentication store
│   │   └── player.ts              # Music player state management
│   └── types.ts                   # TypeScript type definitions
├── routes/
│   ├── +layout.svelte             # Global layout with CSS imports
│   ├── +page.svelte               # Home page
│   ├── login/+page.svelte         # Login page
│   ├── register/+page.svelte      # Registration page
│   ├── forgot-password/+page.svelte # Password reset page
│   ├── upload/+page.svelte        # Music upload interface
│   ├── library/+page.svelte       # User's music library
│   └── search/+page.svelte        # Search functionality
├── app.css                        # Global styles with Tailwind
└── app.html                       # HTML template
```

## Features Implemented

### 1. User Authentication ✅
- Email/password registration with validation
- Login with error handling
- Password reset via email
- Firebase Authentication integration

### 2. Music Player ✅
- Play, pause, skip (next/previous) controls
- Volume adjustment
- Progress bar with seek functionality
- Shuffle mode
- Repeat mode
- Album art display
- Song information display
- Queue management

### 3. Music Upload ✅
- Drag-and-drop file upload
- File picker alternative
- Audio file validation (MP3, WAV, OGG, M4A)
- File size limit (50MB)
- Metadata input (title, artist, genre, description)
- Album art upload
- Firebase Storage integration

### 4. Music Library ✅
- Display all user's uploaded songs
- Edit song metadata
- Delete songs
- Play individual songs or entire library
- Album art display

### 5. Search Functionality ✅
- Search by title, artist, or description
- Filter by genre
- Real-time results
- Play songs from search results

### 6. Dark Theme UI ✅
- Dark gray background (#1F2937, #111827)
- White text
- Orange accent color (#FF6B35)
- Clean, modern design
- Responsive layout

## Firebase Setup Required

### 1. Firebase Console Configuration
You need to complete the following steps in the Firebase Console:

1. **Enable Authentication**
   - Go to Authentication > Sign-in method
   - Enable Email/Password

2. **Create Firestore Database**
   - Go to Firestore Database
   - Click Create database
   - Start in production mode
   - Choose a location

3. **Set Up Storage**
   - Go to Storage
   - Click Get started
   - Choose the same location as Firestore

4. **Deploy Security Rules**
   - Copy contents of `firestore.rules` to Firestore Rules
   - Copy contents of `storage.rules` to Storage Rules
   - Publish both

See `FIREBASE_SETUP.md` for detailed instructions.

## Environment Variables
The following secrets are configured:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_PROJECT_ID`

## Running the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Recent Changes
- Initial project setup with SvelteKit and TypeScript
- Configured Tailwind CSS with dark theme
- Implemented Firebase integration (Auth, Firestore, Storage)
- Created authentication pages with form validation
- Built music player component with Howler.js
- Implemented upload interface with drag-and-drop
- Created library page with edit/delete functionality
- Added search functionality with filtering
- Configured security rules for Firebase

## User Preferences
None specified yet.

## Next Phase Features
The following features are planned for future implementation:
- Playlist creation and management
- Social features (likes, comments, sharing)
- User profiles and follower system
- Popular tracks based on play count
- Advanced search filters
- Social media sharing
- Enhanced streaming security
