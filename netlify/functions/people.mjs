import { getStore } from '@netlify/blobs';

const STORE_NAME = 'people-list';
const KEY = 'people.json';
const IS_DEV = process.env.NETLIFY_DEV === 'true';
let DEV_MEMORY = [];

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let store;
  try {
    store = getStore(STORE_NAME);
  } catch (e) {
    if (!IS_DEV) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Storage initialization failed' }) };
    }
  }

  if (event.httpMethod === 'GET') {
    try {
      if (!store) {
        return { statusCode: 200, headers, body: JSON.stringify(DEV_MEMORY) };
      }
      const json = await store.get(KEY, { type: 'json' });
      const value = Array.isArray(json) ? sanitize(json) : [];
      return { statusCode: 200, headers, body: JSON.stringify(value) };
    } catch (e) {
      if (IS_DEV) {
        return { statusCode: 200, headers, body: JSON.stringify(DEV_MEMORY) };
      }
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to read storage' }) };
    }
  }

  if (event.httpMethod === 'PUT') {
    const token = (event.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    let body;
    try {
      body = JSON.parse(event.body || '[]');
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    if (!Array.isArray(body) || !body.every((v) => typeof v === 'string')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Expected an array of strings' }) };
    }

    const cleaned = sanitize(body);
    try {
      if (!store) {
        DEV_MEMORY = cleaned;
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, dev: true }) };
      }
      await store.set(KEY, JSON.stringify(cleaned));
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (e) {
      if (IS_DEV) {
        DEV_MEMORY = cleaned;
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, dev: true }) };
      }
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to write storage' }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};

function sanitize(names) {
  const set = new Set();
  names.forEach((n) => {
    const v = String(n).trim();
    if (v) set.add(v);
  });
  return Array.from(set);
}

