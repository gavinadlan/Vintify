# Firebase Security Rules Setup

This file contains instructions for setting up Firebase Security Rules for Vintify.

## Firestore Security Rules

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** > **Rules**
4. Copy the contents of `firestore.rules` and paste them into the Firebase Console
5. Click **Publish**

## Storage Security Rules

1. In the Firebase Console, navigate to **Storage** > **Rules**
2. Copy the contents of `storage.rules` and paste them into the Firebase Console
3. Click **Publish**

## What These Rules Do

### Firestore Rules
- Any authenticated user can read all songs
- Users can only create songs with their own userId
- Users can only update and delete their own songs
- Required fields are validated on creation

### Storage Rules
- Any authenticated user can read audio files and album art
- Users can only upload files to their own userId folder
- Users can only delete their own files

## Additional Setup Required

### Enable Authentication
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Save changes

### Create Firestore Database
1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode** (we'll use security rules)
4. Choose a location and create

### Set Up Storage
1. In Firebase Console, go to **Storage**
2. Click **Get started**
3. Use the security rules provided above
4. Choose the same location as your Firestore database

### Add Authorized Domain (After Deployment)
1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your Replit domain (e.g., `yourproject.repl.co` or custom domain)
3. This allows Firebase to redirect users back to your app after authentication
