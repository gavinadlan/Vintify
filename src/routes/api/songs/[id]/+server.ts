import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { db } from '$lib/firebase/config';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

export const PATCH: RequestHandler = async ({ params, request }) => {
  try {
    if (!db) return json({ error: 'Firestore not configured' }, { status: 500 });
    const id = params.id as string;
    if (!id) return json({ error: 'id is required' }, { status: 400 });

    if (!request.headers.get('content-type')?.includes('application/json')) {
      return json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }

    let parsed: any;
    try {
      parsed = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const allowed = new Set(['title','artist','genre','description','albumArt','albumArtPublicId','audioUrl','audioPublicId']);
    const updateData: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed || {})) {
      if (allowed.has(key) && (typeof value === 'string' || value === null)) {
        // allow empty string/null to clear fields
        updateData[key] = value as any;
      }
    }
    if (Object.keys(updateData).length === 0) {
      return json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const songRef = doc(db as any, 'songs', id);
    const existsSnap = await getDoc(songRef as any);
    if (!existsSnap.exists()) {
      return json({ error: 'Song not found' }, { status: 404 });
    }

    await updateDoc(songRef as any, updateData as any);
    return json({ ok: true });
  } catch (err: any) {
    return json({ error: 'Failed to update song', details: err?.message ?? String(err) }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    if (!db) return json({ error: 'Firestore not configured' }, { status: 500 });
    const id = params.id as string;
    if (!id) return json({ error: 'id is required' }, { status: 400 });

    const songRef = doc(db as any, 'songs', id);
    const existsSnap = await getDoc(songRef as any);
    if (!existsSnap.exists()) {
      return json({ error: 'Song not found' }, { status: 404 });
    }

    await deleteDoc(songRef as any);
    return json({ ok: true });
  } catch (err: any) {
    return json({ error: 'Failed to delete song', details: err?.message ?? String(err) }, { status: 500 });
  }
};


