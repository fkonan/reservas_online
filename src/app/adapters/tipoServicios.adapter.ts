import { TipoServicio } from '../models/servicios.model';

export const TipoServiciosAdapter = (response: any): TipoServicio[] => {
  const tipoServicios = Array.isArray(response.data) ? response.data : [];
  if (!tipoServicios.length) {
    return [];
  }

  return tipoServicios.map((c: any) => ({
    id: c.tipo_servicio.id,
    tipo_servicio: c.tipo_servicio.tipo_servicio,
    valor_abono: c.tipo_servicio.valor_abono,
  }));
};
