import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { createHash } from 'crypto';
import { env } from '$env/dynamic/private';

function generateSignature(params: Record<string, string | number>): string {
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys
    .filter((key) => params[key] !== undefined && params[key] !== '' && params[key] !== null)
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  const signatureBase = `${toSign}${env.CLOUDINARY_API_SECRET}`;
  return createHash('sha1').update(signatureBase).digest('hex');
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { timestamp, folder, public_id, resource_type = 'image' } = body as {
      timestamp?: number;
      folder?: string;
      public_id?: string;
      resource_type?: 'image' | 'video' | 'raw';
    };

    if (!env.CLOUDINARY_API_SECRET || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_CLOUD_NAME) {
      return json({ error: 'Cloudinary is not configured' }, { status: 500 });
    }

    const ts = timestamp ?? Math.floor(Date.now() / 1000);
    const paramsToSign: Record<string, string | number> = { timestamp: ts };
    if (folder) paramsToSign.folder = folder;
    if (public_id) paramsToSign.public_id = public_id;

    const signature = generateSignature(paramsToSign);

    return json({
      signature,
      timestamp: ts,
      api_key: env.CLOUDINARY_API_KEY,
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      resource_type
    });
  } catch (err) {
    return json({ error: 'Failed to create signature' }, { status: 500 });
  }
};


