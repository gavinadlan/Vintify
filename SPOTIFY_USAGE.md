# How to Use Spotify Search in Vintify

## Prerequisites
1. Make sure Spotify credentials are set in `.env` file:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```
2. **Restart the development server** after updating `.env`:
   ```bash
   npm run dev
   ```

## How to Search on Spotify

### Step 1: Go to Search Page
Navigate to the **Search** page in the app (usually at `/search`).

### Step 2: Switch to Spotify Tab
You'll see two tabs at the top:
- **My Library** - Search your uploaded songs
- **Spotify** - Search Spotify's catalog

Click on the **Spotify** tab (with the Spotify icon).

### Step 3: Enter Search Query
1. Type your search query in the search box (e.g., "see you again", "ed sheeran", etc.)
2. The search will automatically run after 500ms (debounced)
3. You'll see "Searching Spotify..." while loading

### Step 4: View Results
- Results will show track name, artist, album, and duration
- Tracks with a 30-second preview will show a "30s preview" badge
- Tracks without preview will show "No preview" badge

### Step 5: Filter Results (Optional)
- Check/uncheck "Show only tracks with preview" to filter results
- By default, only tracks with previews are shown

### Step 6: Add to Library
1. Click "Add to Library" button on any track
2. Note: Only tracks with previews can be added (they're playable in the app)
3. Tracks without previews can only be opened in Spotify app

## Troubleshooting

### No Results Appear
1. **Check server console** for errors:
   - Look for "Spotify credentials check" log
   - Check if credentials are loaded correctly
2. **Restart server** if you just updated `.env`
3. **Check browser console** (F12) for API errors
4. **Try different search queries** - some queries may not return results

### "Spotify API not configured" Error
- Make sure `.env` file has `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
- Restart the development server after updating `.env`

### "Invalid credentials" Error
- Verify your Client ID and Client Secret in Spotify Dashboard
- Make sure they match what's in `.env` file

### Results Show But Can't Play
- Only tracks with 30-second previews can be played in the app
- Tracks without previews will show "No preview" badge
- You can still add them to library, but they'll open in Spotify app

## Notes
- Spotify search uses **Client Credentials Flow** (no user login required)
- Only tracks with preview URLs can be played in the app
- Preview URLs are 30-second clips, not full songs
- To listen to full songs, click the Spotify icon to open in Spotify app

