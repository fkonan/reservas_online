// adapters/servicios.adapter.ts
import { CategoriaServicio, Servicios } from '../models/servicios.model';

export const ServiciosAdapter = (response: any): CategoriaServicio[] => {
  // Maneja tanto si la respuesta tiene wrapper de data como si no
  const categorias = response.data ? response.data : Array.isArray(response) ? response : [];

  if (!categorias.length) {
    return [];
  }
  return categorias.map((categoria: any): CategoriaServicio => ({
    id: categoria.id,
    categoria: categoria.categoria,
    orden: categoria.orden ?? 0,
    // El servidor garantiza el orden (orden ASC) — NO reordenar en cliente
    servicios: (categoria.servicios ?? []).map((servicio: any): Servicios => ({
      id: servicio.id,
      nombre_comercial: servicio.nombre_comercial,
      slug: servicio.slug ?? '',
      orden: servicio.orden ?? 0,
      descripcion: servicio.descripcion,
      duracion: servicio.duracion,
      recomendaciones: servicio.recomendaciones,
      iconos: servicio.iconos,
      obsequio: servicio.obsequio,
      imagen: servicio.imagen,
      sede_id: servicio.sede_id,
      tipo_servicio_id: servicio.tipo_servicio_id,
    })),
  }));
};
