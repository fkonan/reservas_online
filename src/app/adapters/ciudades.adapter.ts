import { Ciudades } from '../models/ciudades.model';

export const ciudadesAdapter = (response: any): Ciudades[] => {
  const ciudades = Array.isArray(response.data) ? response.data : [];
  return ciudades.map((c: any) => ({
    id: c.id,
    nombre: c.ciudad,
  }));
};
