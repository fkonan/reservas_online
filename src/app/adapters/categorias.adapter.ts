import { CategoriaServicio } from '../models/servicios.model';

export const CategoriasAdapter = (response: any): CategoriaServicio[] => {
  // Debug: ver la estructura real de la respuesta
  console.log('Response completo:', response);
  console.log('Response.data:', response.data);

  const categorias = Array.isArray(response.data) ? response.data : [];
  if (!categorias.length) {
    // console.log('No hay categorías en la respuesta');
    return [];
  }

  // console.log('Primera categoría:', categorias[0]);

  return categorias.map((c: any) => {
    // Verificar si la estructura es c.categorias.id o directamente c.id
    const categoria = c.categorias || c;

    // console.log('Categoría procesada:', categoria);

    return {
      id: categoria.id,
      categoria: categoria.categoria,
      servicios: categoria.servicios || [],
    };
  }).filter((cat: CategoriaServicio) => cat.id !== undefined && cat.categoria !== undefined);
};
