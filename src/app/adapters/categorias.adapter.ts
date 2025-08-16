import { CategoriaServicio } from '../models/servicios.model';

export const CategoriasAdapter = (response: any): CategoriaServicio[] => {
  const categorias = Array.isArray(response.data) ? response.data : [];
  if (!categorias.length) {
    return [];
  }

  return categorias.map((c: any) => ({
    id: c.categorias.id,
    categoria: c.categorias.categoria,
  }));
};
