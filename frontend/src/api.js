const BASE = import.meta.env.VITE_API_URL;

export const getToken = () => localStorage.getItem('token');
export const setToken = (t) => (t ? localStorage.setItem('token', t) : localStorage.removeItem('token'));

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '');
export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
