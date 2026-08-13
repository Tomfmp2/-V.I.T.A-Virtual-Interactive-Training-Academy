// Mock que replica el contrato real de Vita.Api/Controllers/CategoriesController.cs
// Sirve para ejercitar el frontend sin tocar la base de datos de desarrollo.
import { createServer } from 'node:http';

let categorias = [
  { id: 1, nombre: 'Desarrollo', slug: 'desarrollo', descripcion: 'Cursos de programación', iconoUrl: null, activo: true },
  { id: 2, nombre: 'Diseño', slug: 'diseno', descripcion: 'UX/UI y producto', iconoUrl: null, activo: true },
  { id: 3, nombre: 'Marketing', slug: 'marketing', descripcion: null, iconoUrl: null, activo: true },
];

// La categoría 1 tiene cursos asociados -> DELETE responde 409 (CategoryOutcome.InUse).
const categoriasEnUso = new Set([1]);
let nextId = 4;

const slugify = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-');

const send = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': '*',
  });
  res.end(body === undefined ? '' : JSON.stringify(body));
};

// Espejo de BaseApiController.ApiError
const apiError = (res, statusCode, message) => send(res, statusCode, { error: message, statusCode });

const readBody = (req) =>
  new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data ? JSON.parse(data) : {}));
  });

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  if (req.method !== 'OPTIONS') console.log(`[mock] ${req.method} ${pathname}`);

  if (req.method === 'OPTIONS') return send(res, 204);

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    return send(res, 200, {
      token: 'mock-token',
      expiraEn: 3600,
      usuario: { id: 'u1', nombre: 'Andrés', email: 'admin@vita.co', rol: 'Admin' },
    });
  }

  if (pathname === '/api/auth/me' && req.method === 'GET') {
    return send(res, 200, { id: 'u1', nombre: 'Andrés', email: 'admin@vita.co', rol: 'Admin', activo: true });
  }

  // Todos los endpoints de categorías requieren autenticación ([Authorize])
  if (pathname.startsWith('/api/categories')) {
    if (!req.headers.authorization) return apiError(res, 401, 'No autenticado.');
  }

  if (pathname === '/api/categories') {
    if (req.method === 'GET') return send(res, 200, categorias);

    if (req.method === 'POST') {
      const body = await readBody(req);
      if (categorias.some((c) => c.nombre.toLowerCase() === (body.nombre || '').toLowerCase())) {
        return apiError(res, 409, 'Ya existe una categoría con ese nombre.');
      }
      const nueva = {
        id: nextId++,
        nombre: body.nombre,
        slug: slugify(body.nombre),
        descripcion: body.descripcion ?? null,
        iconoUrl: body.iconoUrl ?? null,
        activo: true,
      };
      categorias.push(nueva);
      return send(res, 201, nueva);
    }
  }

  const match = pathname.match(/^\/api\/categories\/(\d+)$/);
  if (match) {
    const id = Number(match[1]);
    const index = categorias.findIndex((c) => c.id === id);
    if (index === -1) return apiError(res, 404, 'Categoría no encontrada.');

    if (req.method === 'PUT') {
      const body = await readBody(req);
      if (categorias.some((c) => c.id !== id && c.nombre.toLowerCase() === (body.nombre || '').toLowerCase())) {
        return apiError(res, 409, 'Ya existe una categoría con ese nombre.');
      }
      categorias[index] = {
        ...categorias[index],
        nombre: body.nombre,
        slug: slugify(body.nombre),
        descripcion: body.descripcion ?? null,
        iconoUrl: body.iconoUrl ?? null,
      };
      return send(res, 200, categorias[index]);
    }

    if (req.method === 'DELETE') {
      if (categoriasEnUso.has(id)) {
        return apiError(res, 409, 'No se puede eliminar: la categoría está en uso por cursos.');
      }
      categorias = categorias.filter((c) => c.id !== id);
      return send(res, 204);
    }
  }

  apiError(res, 404, 'Ruta no encontrada.');
}).listen(5045, () => console.log('[mock] escuchando en http://localhost:5045'));
