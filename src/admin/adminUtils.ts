export const CJ_CATEGORIES = ['All', 'Shirt', 'Dress', 'Pants', 'Coat', 'Jacket', 'Accessories', 'Shoes', 'Bags', 'Swimwear'];

export function authFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const token = sessionStorage.getItem('admin_token') || '';
  const headers = new Headers(opts.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...opts, headers });
}

export async function handleAuthResponse(res: Response): Promise<Response> {
  if (res.status === 401) {
    sessionStorage.removeItem('admin_token');
    window.location.reload();
  }
  return res;
}

export async function downloadCsv(url: string, filename: string) {
  const res = await handleAuthResponse(await authFetch(url));
  if (!res.ok) return;
  const blob = await res.blob();
  const objUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objUrl), 1000);
}

export function parseVariantName(name: string) {
  const parts = (name || '').split('/').map((p: string) => p.trim()).filter(Boolean);
  return {
    color: parts.length > 1 ? parts[0] : null,
    size: parts.length > 1 ? parts[parts.length - 1] : parts[0] || '',
    full: name || '',
  };
}
