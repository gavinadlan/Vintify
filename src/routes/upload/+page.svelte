<script lang="ts">
  import { auth, storage, db } from '$lib/firebase/config';
  import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
  import { collection, addDoc } from 'firebase/firestore';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let user: any = null;
  let file: File | null = null;
  let title = '';
  let artist = '';
  let genre = '';
  let description = '';
  let albumArtFile: File | null = null;
  let albumArtPreview = '';
  let uploading = false;
  let uploadProgress = 0;
  let error = '';
  let dragOver = false;

  onMount(() => {
    user = auth.currentUser;
    if (!user) {
      goto('/login');
    }
  });

  function handleFileDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }

  function handleFileInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      handleFileSelect(target.files[0]);
    }
  }

  function handleFileSelect(selectedFile: File) {
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'];
    const maxSize = 50 * 1024 * 1024;

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
      error = 'Please upload a valid audio file (MP3, WAV, OGG, or M4A)';
      return;
    }

    if (selectedFile.size > maxSize) {
      error = 'File size must be less than 50MB';
      return;
    }

    file = selectedFile;
    error = '';
    
    if (!title) {
      title = selectedFile.name.replace(/\.[^/.]+$/, '');
    }
  }

  function handleAlbumArtInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      
      if (!file.type.startsWith('image/')) {
        error = 'Please upload a valid image file';
        return;
      }

      albumArtFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        albumArtPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleUpload() {
    if (!file || !title || !artist || !genre) {
      error = 'Please fill in all required fields and select an audio file';
      return;
    }

    if (!user) {
      error = 'You must be logged in to upload';
      goto('/login');
      return;
    }

    uploading = true;
    error = '';
    uploadProgress = 0;

    try {
      let albumArtUrl = '';
      
      if (albumArtFile) {
        const albumArtRef = ref(storage, `album-art/${user.uid}/${Date.now()}_${albumArtFile.name}`);
        const albumArtSnapshot = await uploadBytesResumable(albumArtRef, albumArtFile);
        albumArtUrl = await getDownloadURL(albumArtSnapshot.ref);
      }

      const audioRef = ref(storage, `music/${user.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(audioRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          console.error('Upload error:', error);
          throw error;
        },
        async () => {
          const audioUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          await addDoc(collection(db, 'songs'), {
            title,
            artist,
            genre,
            description,
            albumArt: albumArtUrl,
            audioUrl,
            userId: user.uid,
            createdAt: Date.now()
          });

          goto('/library');
        }
      );
    } catch (err) {
      console.error('Upload error:', err);
      error = 'Failed to upload song. Please try again.';
      uploading = false;
    }
  }
</script>

<svelte:head>
  <title>Upload Music - Vintify</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 py-8 px-4 pb-32">
  <div class="max-w-2xl mx-auto">
    <h1 class="text-4xl font-bold text-white mb-8">Upload Music</h1>

    {#if error}
      <div class="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
        {error}
      </div>
    {/if}

    <div class="bg-gray-800 rounded-lg p-6 space-y-6">
      <!-- File Upload Area -->
      <div
        class="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center transition"
        class:border-orange-500={dragOver}
        class:bg-gray-700={dragOver}
        on:dragover={(e) => { e.preventDefault(); dragOver = true; }}
        on:dragleave={() => dragOver = false}
        on:drop={handleFileDrop}
      >
        {#if file}
          <div class="text-white">
            <svg class="w-12 h-12 mx-auto mb-2 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
            </svg>
            <p class="font-medium">{file.name}</p>
            <p class="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <button
              on:click={() => file = null}
              class="mt-2 text-orange-500 hover:text-orange-400 text-sm"
            >
              Change file
            </button>
          </div>
        {:else}
          <svg class="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-white mb-2">Drag and drop your audio file here</p>
          <p class="text-gray-400 text-sm mb-4">or</p>
          <label class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg cursor-pointer inline-block transition">
            Choose File
            <input type="file" class="hidden" accept="audio/*,.mp3,.wav,.ogg,.m4a" on:change={handleFileInput} />
          </label>
          <p class="text-gray-500 text-xs mt-4">Supported formats: MP3, WAV, OGG, M4A (Max 50MB)</p>
        {/if}
      </div>

      <!-- Song Details -->
      <div class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-300 mb-2">
            Song Title <span class="text-orange-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            bind:value={title}
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
            placeholder="Enter song title"
            required
          />
        </div>

        <div>
          <label for="artist" class="block text-sm font-medium text-gray-300 mb-2">
            Artist <span class="text-orange-500">*</span>
          </label>
          <input
            type="text"
            id="artist"
            bind:value={artist}
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
            placeholder="Enter artist name"
            required
          />
        </div>

        <div>
          <label for="genre" class="block text-sm font-medium text-gray-300 mb-2">
            Genre <span class="text-orange-500">*</span>
          </label>
          <select
            id="genre"
            bind:value={genre}
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
            required
          >
            <option value="">Select a genre</option>
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="Hip Hop">Hip Hop</option>
            <option value="Electronic">Electronic</option>
            <option value="Jazz">Jazz</option>
            <option value="Classical">Classical</option>
            <option value="R&B">R&B</option>
            <option value="Country">Country</option>
            <option value="Indie">Indie</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            bind:value={description}
            rows="3"
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
            placeholder="Add a description (optional)"
          ></textarea>
        </div>

        <div>
          <label for="albumArt" class="block text-sm font-medium text-gray-300 mb-2">
            Album Art
          </label>
          {#if albumArtPreview}
            <div class="mb-2">
              <img src={albumArtPreview} alt="Album art preview" class="w-32 h-32 object-cover rounded" />
              <button
                on:click={() => { albumArtFile = null; albumArtPreview = ''; }}
                class="mt-2 text-orange-500 hover:text-orange-400 text-sm"
              >
                Remove
              </button>
            </div>
          {/if}
          <label class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer inline-block transition">
            {albumArtPreview ? 'Change Image' : 'Upload Image'}
            <input type="file" class="hidden" accept="image/*" on:change={handleAlbumArtInput} />
          </label>
        </div>
      </div>

      <!-- Upload Progress -->
      {#if uploading}
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Uploading...</span>
            <span class="text-gray-400">{uploadProgress.toFixed(0)}%</span>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-2">
            <div class="bg-orange-500 h-2 rounded-full transition-all" style="width: {uploadProgress}%"></div>
          </div>
        </div>
      {/if}

      <!-- Action Buttons -->
      <div class="flex gap-4">
        <button
          on:click={handleUpload}
          disabled={uploading || !file}
          class="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
        >
          {uploading ? 'Uploading...' : 'Upload Song'}
        </button>
        <a
          href="/library"
          class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
        >
          Cancel
        </a>
      </div>
    </div>
  </div>
</div>
