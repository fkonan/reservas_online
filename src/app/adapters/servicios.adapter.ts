import { environment } from '../environments/env.dev';
import { Servicios } from '../shared/models/servicios.model';

export const ServiciosAdapter = (response: any): Servicios[] => {
  const servicios = Array.isArray(response.data) ? response.data : [];
  const url = environment.baseUrl;
  if (!servicios.length) {
    return [];
  }

  return servicios.map((c: any) => ({
    id: c.id,
    servicio: c.servicio,
    tipo_servicio: c.tipo_servicio,
    tipo_servicio_id: c.tipo_servicio_id,
    nombre_comercial: c.nombre_comercial,
    descripcion: c.descripcion,
    duracion: c.duracion,
    sede_id: c.sede_id,
    estado: c.estado,
  }));
};
