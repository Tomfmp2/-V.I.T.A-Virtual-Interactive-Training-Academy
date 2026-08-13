/** Espejo de Vita.Api Dtos/Categories/CategoryResponse.cs */
export interface Category {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  iconoUrl?: string | null;
  activo: boolean;
}

/** Espejo de Vita.Api Dtos/Categories/CategoryRequest.cs */
export interface CategoryRequest {
  nombre: string;
  descripcion?: string | null;
  iconoUrl?: string | null;
}

export const CATEGORY_NAME_MIN_LENGTH = 3;
export const CATEGORY_NAME_MAX_LENGTH = 60;
export const CATEGORY_DESCRIPTION_MAX_LENGTH = 250;
export const CATEGORY_ICON_URL_MAX_LENGTH = 255;
