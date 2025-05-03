import { Clientes } from '../models/clientes.model';

export const clientesAdapter = (response: any): Clientes[] => {
  const cliente = Array.isArray(response.data)
    ? response.data
    : typeof response.data === 'object' && response.data !== null
    ? [response.data]
    : [];

  if (!cliente.length) {
    return [];
  }

  return cliente.map((c: any) => ({
    id: c.id,
    documento: c.documento,
    nombres: c.nombres,
    apellidos: c.apellidos,
    telefono: c.telefono,
    fecha_nacimiento: c.fecha_nacimiento,
    whatsapp: c.whatsapp,
    correo: c.correo,
    direccion: c.direccion,
    estado: c.estado,
  }));
};
