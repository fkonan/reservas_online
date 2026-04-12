import { CategoriaServicio, Servicios } from '../models/servicios.model';

export const CategoriasAdapter = (response: any): CategoriaServicio[] => {
  const categorias = Array.isArray(response.data) ? response.data : [];
  if (!categorias.length) {
    return [];
  }

  return categorias
    .map((c: any): CategoriaServicio => {
      const categoria = c.categorias || c;
      return {
        id: categoria.id,
        categoria: categoria.categoria,
        orden: categoria.orden ?? 0,
        // El servidor garantiza el orden (orden ASC) — NO reordenar en cliente
        servicios: (categoria.servicios ?? []).map((s: any): Servicios => ({
          id: s.id,
          nombre_comercial: s.nombre_comercial,
          slug: s.slug ?? '',
          orden: s.orden ?? 0,
          descripcion: s.descripcion,
          duracion: s.duracion,
          recomendaciones: s.recomendaciones,
          iconos: s.iconos,
          obsequio: s.obsequio,
          imagen: s.imagen,
          sede_id: s.sede_id,
          tipo_servicio_id: s.tipo_servicio_id,
        })),
      };
    })
    .filter((cat: CategoriaServicio) => cat.id !== undefined && cat.categoria !== undefined);
};
