import { useCallback, useEffect, useState } from 'react';
import { getCategoriesApi } from '../api/categoriesApi';
import type { Category } from '../types/category';

/**
 * Lista de categorías siempre recargada desde el servidor: nunca se muta en local.
 * `enabled` evita pedir datos cuando el rol no puede verlos (los hooks corren
 * antes de cualquier early return del componente).
 */
export const useCategories = (enabled = true) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [loadError, setLoadError] = useState('');

  const refetch = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setLoadError('');

    try {
      setCategories(await getCategoriesApi());
    } catch {
      setLoadError('No se pudieron cargar las categorías.');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { categories, isLoading, loadError, refetch };
};
