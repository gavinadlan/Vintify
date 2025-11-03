import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { db } from '$lib/firebase/config';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

export const GET: RequestHandler = async ({ url }) => {
  try {
    if (!db) return json({ error: 'Firestore not configured' }, { status: 500 });
    const userId = url.searchParams.get('userId');
    const base = collection(db as any, 'songs');
    const q = userId
      ? query(base, where('userId', '==', userId), orderBy('createdAt', 'desc'))
      : query(base, orderBy('createdAt', 'desc'));
    const qs = await getDocs(q);
    const songs = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
    return json({ songs });
  } catch (err: any) {
    return json({ error: 'Failed to fetch songs', details: err?.message ?? String(err) }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    if (!db) return json({ error: 'Firestore not configured' }, { status: 500 });
    if (!request.headers.get('content-type')?.includes('application/json')) {
      return json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }
    let body: any;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { title, artist, genre, description, albumArt, albumArtPublicId, audioUrl, audioPublicId, userId, createdAt } = body || {};
    if (!title || !artist || !genre || !audioUrl || !userId) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    const docRef = await addDoc(collection(db as any, 'songs'), {
      title,
      artist,
      genre,
      description: description || '',
      albumArt: albumArt || '',
      albumArtPublicId: albumArtPublicId || '',
      audioUrl,
      audioPublicId: audioPublicId || '',
      userId,
      createdAt: typeof createdAt === 'number' ? createdAt : Date.now()
    });
    return json({ id: docRef.id }, { status: 201 });
  } catch (err: any) {
    return json({ error: 'Failed to save song', details: err?.message ?? String(err) }, { status: 500 });
  }
};


