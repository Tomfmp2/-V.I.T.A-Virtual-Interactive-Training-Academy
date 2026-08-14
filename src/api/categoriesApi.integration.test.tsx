// @vitest-environment node
//
// Prueba de integración contra el mock que replica CategoriesController.cs.
// Requiere el mock levantado:  npm run mock:api
// Si no está corriendo, la suite se salta en vez de fallar (CI y compañeros).
import { beforeAll, describe, expect, it } from 'vitest';
import { isAxiosError } from 'axios';
import {
  createCategoryApi,
  deleteCategoryApi,
  getCategoriesApi,
  updateCategoryApi,
} from './categoriesApi';
import { resolveDeleteCategoryError } from '../utils/apiErrors';

const MOCK_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5045/api';

const isMockUp = await fetch(`${MOCK_URL}/categories`, { headers: { authorization: 'ping' } })
  .then((response) => response.ok)
  .catch(() => false);

beforeAll(() => {
  // http.ts lee el token de localStorage, que no existe en el entorno node.
  globalThis.localStorage = {
    getItem: () => 'token-de-prueba',
  } as unknown as Storage;
});

describe.skipIf(!isMockUp)('categoriesApi contra el contrato real', () => {
  it('GET /api/categories devuelve la forma de CategoryResponse', async () => {
    const categorias = await getCategoriesApi();

    expect(categorias.length).toBeGreaterThan(0);
    expect(categorias[0]).toMatchObject({
      id: expect.any(Number),
      nombre: expect.any(String),
      slug: expect.any(String),
      activo: expect.any(Boolean),
    });
  });

  it('POST + PUT + DELETE completan el ciclo', async () => {
    const creada = await createCategoryApi({ nombre: 'Temporal QA', descripcion: 'temp' });
    expect(creada.id).toEqual(expect.any(Number));
    expect(creada.slug).toBe('temporal-qa');

    const actualizada = await updateCategoryApi(creada.id, { nombre: 'Temporal QA 2' });
    expect(actualizada.nombre).toBe('Temporal QA 2');

    await expect(deleteCategoryApi(creada.id)).resolves.toBeUndefined();
  });

  it('DELETE de una categoría en uso responde 409 y se traduce al texto de la tarjeta', async () => {
    await expect(deleteCategoryApi(1)).rejects.toSatisfy(
      (error: unknown) => isAxiosError(error) && error.response?.status === 409,
    );

    const error = await deleteCategoryApi(1).catch((e: unknown) => e);
    expect(resolveDeleteCategoryError(error)).toBe('No se puede borrar: categoría en uso');
  });
});
