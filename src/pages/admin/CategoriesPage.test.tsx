// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { AuthProvider } from '../../context/AuthProvider';
import { CategoriesPage } from './CategoriesPage';
import type { Category } from '../../types/category';

vi.mock('../../api/categoriesApi', () => ({
  getCategoriesApi: vi.fn(),
  createCategoryApi: vi.fn(),
  updateCategoryApi: vi.fn(),
  deleteCategoryApi: vi.fn(),
}));

import {
  createCategoryApi,
  deleteCategoryApi,
  getCategoriesApi,
  updateCategoryApi,
} from '../../api/categoriesApi';

const httpError = (status: number) =>
  new AxiosError('request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: '',
    data: { error: 'x', statusCode: status },
    headers: {},
    config: { headers: {} },
  } as never);

const desarrollo: Category = {
  id: 1, nombre: 'Desarrollo', slug: 'desarrollo',
  descripcion: 'Cursos de programación', iconoUrl: null, activo: true,
};
const marketing: Category = {
  id: 3, nombre: 'Marketing', slug: 'marketing',
  descripcion: null, iconoUrl: null, activo: true,
};

const signIn = (rol: string) => {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('user', JSON.stringify({ id: 'u1', nombre: 'Andrés', email: 'a@vita.co', rol }));
};

const renderPage = () =>
  render(
    <AuthProvider>
      <CategoriesPage />
    </AuthProvider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  signIn('Admin');
  vi.mocked(getCategoriesApi).mockResolvedValue([desarrollo, marketing]);
});

afterEach(() => cleanup());

describe('CategoriesPage — lectura', () => {
  it('muestra loading y luego la lista', async () => {
    renderPage();
    expect(screen.getByText('Cargando categorías…')).toBeTruthy();

    expect(await screen.findByText('Desarrollo')).toBeTruthy();
    expect(screen.getByText('Marketing')).toBeTruthy();
  });

  it('muestra estado vacío', async () => {
    vi.mocked(getCategoriesApi).mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText(/Todavía no hay categorías/)).toBeTruthy();
  });

  it('muestra error de carga con opción de reintentar', async () => {
    vi.mocked(getCategoriesApi).mockRejectedValue(httpError(500));
    renderPage();

    expect(await screen.findByText('No se pudieron cargar las categorías.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
  });
});

describe('CategoriesPage — DELETE 409 (regla central de la tarjeta)', () => {
  it('muestra el mensaje exacto y NO borra la categoría de la lista', async () => {
    const user = userEvent.setup();
    vi.mocked(deleteCategoryApi).mockRejectedValue(httpError(409));

    renderPage();
    await screen.findByText('Desarrollo');

    const filaDesarrollo = screen.getByText('Desarrollo').closest('tr')!;
    await user.click(within(filaDesarrollo).getByRole('button', { name: 'Eliminar' }));

    const dialogo = await screen.findByRole('alertdialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Eliminar' }));

    // 1. mensaje literal exigido por la tarjeta
    expect(await screen.findByText('No se puede borrar: categoría en uso')).toBeTruthy();

    // 2. la categoría sigue en la tabla: el borrado nunca es silencioso
    expect(within(screen.getByRole('table')).getByText('Desarrollo')).toBeTruthy();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);

    // 3. no se recargó la lista como si hubiera funcionado
    expect(vi.mocked(getCategoriesApi)).toHaveBeenCalledTimes(1);

    // 4. el diálogo sigue abierto con el error visible
    expect(screen.getByRole('alertdialog')).toBeTruthy();
  });

  it('marca la categoría como "En uso" al cerrar el diálogo', async () => {
    const user = userEvent.setup();
    vi.mocked(deleteCategoryApi).mockRejectedValue(httpError(409));

    renderPage();
    await screen.findByText('Desarrollo');

    const fila = screen.getByText('Desarrollo').closest('tr')!;
    await user.click(within(fila).getByRole('button', { name: 'Eliminar' }));
    const dialogo = await screen.findByRole('alertdialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Eliminar' }));
    await screen.findByText('No se puede borrar: categoría en uso');

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByText('En uso')).toBeTruthy();
    expect(screen.getByText('Desarrollo')).toBeTruthy();
  });
});

describe('CategoriesPage — DELETE correcto', () => {
  it('elimina la fila solo tras respuesta 2xx, releyendo del servidor', async () => {
    const user = userEvent.setup();
    vi.mocked(deleteCategoryApi).mockResolvedValue(undefined);
    vi.mocked(getCategoriesApi)
      .mockResolvedValueOnce([desarrollo, marketing])
      .mockResolvedValueOnce([desarrollo]);

    renderPage();
    await screen.findByText('Marketing');

    const fila = screen.getByText('Marketing').closest('tr')!;
    await user.click(within(fila).getByRole('button', { name: 'Eliminar' }));
    const dialogo = await screen.findByRole('alertdialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(screen.queryByText('Marketing')).toBeNull());
    expect(vi.mocked(deleteCategoryApi)).toHaveBeenCalledWith(3);
    expect(vi.mocked(getCategoriesApi)).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Categoría "Marketing" eliminada.')).toBeTruthy();
  });
});

describe('CategoriesPage — CREATE / UPDATE', () => {
  it('crea una categoría con los valores recortados', async () => {
    const user = userEvent.setup();
    vi.mocked(createCategoryApi).mockResolvedValue(marketing);

    renderPage();
    await screen.findByText('Desarrollo');

    await user.click(screen.getByRole('button', { name: 'Nueva categoría' }));
    await user.type(screen.getByLabelText(/^Nombre$/), '  Datos  ');
    await user.type(screen.getByLabelText(/Descripción/), ' Analítica ');
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));

    await waitFor(() =>
      expect(vi.mocked(createCategoryApi)).toHaveBeenCalledWith({
        nombre: 'Datos',
        descripcion: 'Analítica',
        iconoUrl: null,
      }),
    );
    expect(vi.mocked(getCategoriesApi)).toHaveBeenCalledTimes(2);
  });

  it('rechaza nombres de menos de 3 caracteres sin llamar al backend', async () => {
    const user = userEvent.setup();

    renderPage();
    await screen.findByText('Desarrollo');

    await user.click(screen.getByRole('button', { name: 'Nueva categoría' }));
    await user.type(screen.getByLabelText(/^Nombre$/), 'ab');
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));

    expect(await screen.findByText('El nombre debe tener al menos 3 caracteres.')).toBeTruthy();
    expect(vi.mocked(createCategoryApi)).not.toHaveBeenCalled();
  });

  it('muestra el 409 de nombre duplicado sin cerrar el formulario', async () => {
    const user = userEvent.setup();
    vi.mocked(createCategoryApi).mockRejectedValue(httpError(409));

    renderPage();
    await screen.findByText('Desarrollo');

    await user.click(screen.getByRole('button', { name: 'Nueva categoría' }));
    await user.type(screen.getByLabelText(/^Nombre$/), 'Desarrollo');
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));

    expect(await screen.findByText('Ya existe una categoría con ese nombre.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Crear categoría' })).toBeTruthy();
  });

  it('edita una categoría existente precargando sus valores', async () => {
    const user = userEvent.setup();
    vi.mocked(updateCategoryApi).mockResolvedValue({ ...desarrollo, nombre: 'Desarrollo Web' });

    renderPage();
    await screen.findByText('Desarrollo');

    const fila = screen.getByText('Desarrollo').closest('tr')!;
    await user.click(within(fila).getByRole('button', { name: 'Editar' }));

    const nombre = screen.getByLabelText(/^Nombre$/);
    expect((nombre as HTMLInputElement).value).toBe('Desarrollo');

    await user.clear(nombre);
    await user.type(nombre, 'Desarrollo Web');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(vi.mocked(updateCategoryApi)).toHaveBeenCalledWith(1, {
        nombre: 'Desarrollo Web',
        descripcion: 'Cursos de programación',
        iconoUrl: null,
      }),
    );
  });
});

describe('CategoriesPage — permisos', () => {
  it('bloquea a un estudiante', async () => {
    signIn('Estudiante');
    renderPage();

    expect(screen.getByText('Acceso no permitido')).toBeTruthy();
    expect(vi.mocked(getCategoriesApi)).not.toHaveBeenCalled();
  });
});
