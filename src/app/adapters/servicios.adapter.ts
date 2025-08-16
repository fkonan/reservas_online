// adapters/servicios.adapter.ts
import { CategoriaServicio, Servicios } from '../models/servicios.model';

export const ServiciosAdapter = (response: any): CategoriaServicio[] => {
  // Maneja tanto si la respuesta tiene wrapper de data como si no
  const categorias = response.data ? response.data : Array.isArray(response) ? response : [];

  if (!categorias.length) {
    return [];
  }
  return categorias.map((categoria: any) => ({
    id: categoria.id,
    categoria: categoria.categoria,
    servicios: categoria.servicios
      ? categoria.servicios.map((servicio: any) => ({
          id: servicio.id,
          nombre_comercial: servicio.nombre_comercial,
          descripcion: servicio.descripcion,
          duracion: servicio.duracion,
          recomendaciones: servicio.recomendaciones,
          iconos: servicio.iconos,
          obsequio: servicio.obsequio,
          imagen: servicio.imagen,
          tipo_servicio_id:servicio.tipo_servicio_id
        }))
      : [],
  }));
};
