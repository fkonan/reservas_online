import { environment } from '../environments/env.dev';
import { Sedes } from '../shared/models/sedes.model';

export const sedesAdapter = (response: any): Sedes[] => {
  const sedes = Array.isArray(response.data) ? response.data : [];
  const url = environment.baseUrl;
  if (!sedes.length) {
    return [];
  }

  return sedes.map((c: any) => ({
    id: c.id,
    ciudad_id: c.ciudad_id,
    nombre_sede: c.nombre_sede,
    documento_responsable: c.documento_responsable,
    nombre_responsable: c.nombre_responsable,
    direccion: c.direccion,
    telefono: c.telefono,
    horario_atencion: c.horario_atencion,
    correo_sede: c.correo_sede,
    whatsapp: c.whatsapp,
    foto: `${url}storage/${c.foto}`,
    estado: c.estado,
  }));
};
