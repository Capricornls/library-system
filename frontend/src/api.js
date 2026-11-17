// Small wrapper around fetch so every page talks to the backend the same way.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, method = 'GET', body) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) options.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(BASE + path, options);
  } catch {
    throw new Error('Cannot reach the server. Check that the backend is running.');
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, 'POST', body),
  put: (path, body) => request(path, 'PUT', body),
  delete: (path) => request(path, 'DELETE'),
};
