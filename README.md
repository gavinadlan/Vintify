# Vintify 🎵

A modern music streaming app built with SvelteKit where users can upload, manage, and stream their own music collection.

## Features

### 🔐 User Authentication
- Email/password registration with validation
- Secure login system
- Password reset via email
- Firebase Authentication integration

### 🎵 Music Player
- Full playback controls (play, pause, next, previous)
- Volume adjustment
- Interactive progress bar with seek functionality
- **Shuffle mode** - randomize playback order
- **Repeat mode** - loop your music
- Album art display
- Real-time song information

### 📤 Music Upload
- **Drag-and-drop** file upload interface
- File picker alternative
- Supported formats: MP3, WAV, OGG, M4A
- File size limit: 50MB
- Metadata management:
  - Song title
  - Artist name
  - Genre selection
  - Description (optional)
  - Album art upload
- Secure Firebase Storage integration

### 📚 Music Library
- View all your uploaded songs
- Edit song metadata
- Delete songs (removes from storage and database)
- Play individual songs or entire library
- Album art thumbnails

### 🔍 Search & Discovery
- **My Library**: Search by title, artist, or description in your uploaded songs
- **Spotify Integration**: Search and discover tracks from Spotify
  - Search millions of tracks from Spotify's catalog
  - Filter to show only tracks with 30-second previews
  - Add Spotify tracks to your library
  - Play 30-second previews directly in the app
- Filter by genre (for library)
- Real-time search results
- Play songs directly from search

### 🎨 Dark Theme UI
- Modern, minimalist design
- Dark gray background (#1F2937, #111827)
- White text for readability
- Orange accent color (#FF6B35)
- Responsive layout for all screen sizes

## Tech Stack

- **Frontend**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS
- **Audio Playback**: Howler.js
- **Backend**: Firebase
  - Authentication (Email/Password)
  - Firestore (Database)
  - Storage (Audio files & images)

## Getting Started

### Prerequisites

1. Node.js 20 or higher
2. Firebase account
3. Firebase project with:
   - Authentication enabled (Email/Password method)
   - Firestore Database created
   - Storage enabled

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Follow the instructions in `FIREBASE_SETUP.md`
   - Create a `.env` file in the root directory with:
     - `PUBLIC_FIREBASE_API_KEY`
     - `PUBLIC_FIREBASE_PROJECT_ID`
     - `PUBLIC_FIREBASE_APP_ID`
   - See `FIREBASE_ENV_SETUP.md` for detailed instructions

4. Deploy Firebase Security Rules:
   - Copy `firestore.rules` to Firebase Console (Firestore Database > Rules)
   - Copy `storage.rules` to Firebase Console (Storage > Rules)

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open your browser to `http://localhost:5000`

## Firebase Setup

Detailed setup instructions are available in `FIREBASE_SETUP.md`. You'll need to:

1. Enable Email/Password authentication
2. Create a Firestore database
3. Set up Firebase Storage
4. Deploy security rules
5. Add authorized domains (for production)

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── MusicPlayer.svelte  # Music player with all controls
│   │   └── Navbar.svelte        # Navigation bar
│   ├── firebase/
│   │   └── config.ts            # Firebase initialization
│   ├── stores/
│   │   ├── auth.ts              # User authentication state
│   │   └── player.ts            # Music player state
│   └── types.ts                 # TypeScript types
├── routes/
│   ├── +page.svelte             # Home/landing page
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── forgot-password/         # Password reset page
│   ├── upload/                  # Music upload interface
│   ├── library/                 # User's music library
│   └── search/                  # Search functionality
└── app.css                      # Global styles
```

## Security

- **Authentication**: All protected routes require user login
- **Firestore Rules**: Users can only read/write their own songs
- **Storage Rules**: Users can only access files in their own folder
- **File Validation**: Client-side validation for file type and size
- **Secure Uploads**: Files stored with user ID prefix for isolation

## Usage

### Uploading Music

1. Log in to your account
2. Click "Upload Music" or navigate to `/upload`
3. Drag and drop an audio file or click "Choose File"
4. Fill in song details (title, artist, genre)
5. Optionally add album art
6. Click "Upload Song"

### Playing Music

1. Navigate to "My Library"
2. Click the play button on any song
3. Use the player controls at the bottom:
   - Play/Pause
   - Skip forward/backward
   - Adjust volume
   - Enable shuffle/repeat
   - Seek through the track

### Managing Your Library

- **Edit**: Click the edit button to update song metadata
- **Delete**: Click the delete button to remove a song
- **Play All**: Play your entire library in order

### Searching

1. Navigate to "Search"
2. Enter keywords in the search box
3. Filter by genre using the dropdown
4. Click play on any result to start listening

## Known Limitations

- Maximum file size: 50MB per audio file
- Supported audio formats: MP3, WAV, OGG, M4A
- Development mode only - deploy security rules before production use

## Future Enhancements

Planned features for future releases:
- Custom playlist creation
- Social features (likes, comments, sharing)
- User profiles and follower system
- Popular tracks section with play counts
- Advanced search filters
- Social media sharing
- Enhanced streaming security

## License

This project is for educational purposes.

## Support

For Firebase setup issues, refer to `FIREBASE_SETUP.md`.
For general questions, check the Firebase documentation at https://firebase.google.com/docs
