/**
 * Convierte una ruta relativa del backend (/uploads/...) en URL absoluta.
 */
export const getProfilePhotoUrl = (
  fotoUrl?: string | null,
  cacheVersion?: number,
): string | null => {
  if (!fotoUrl) return null;

  if (/^(https?:|blob:|data:)/i.test(fotoUrl)) {
    return fotoUrl;
  }

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5044/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  const path = fotoUrl.startsWith('/') ? fotoUrl : `/${fotoUrl}`;
  const base = `${origin}${path}`;

  return cacheVersion ? `${base}?v=${cacheVersion}` : base;
};
