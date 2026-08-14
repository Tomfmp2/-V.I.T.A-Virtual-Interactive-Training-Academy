/**
 * Convierte una ruta relativa del backend (/uploads/...) en URL absoluta.
 * Sirve para fotos de perfil, portadas de curso y cualquier archivo estático.
 */
export const getUploadUrl = (
  relativeUrl?: string | null,
  cacheVersion?: number,
): string | null => {
  if (!relativeUrl) return null;

  if (/^(https?:|blob:|data:)/i.test(relativeUrl)) {
    return relativeUrl;
  }

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5044/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  const path = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
  const base = `${origin}${path}`;

  return cacheVersion ? `${base}?v=${cacheVersion}` : base;
};

/** Alias histórico para foto de perfil. */
export const getProfilePhotoUrl = getUploadUrl;

export const getCourseCoverUrl = getUploadUrl;
