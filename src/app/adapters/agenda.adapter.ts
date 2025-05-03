import { Agenda } from "../models/agenda.model";

export const AgendaAdapter = (response: any): Agenda[] => {
  const agenda = Object.values(response.data).flat();
  if (!agenda.length) {
    return [];
  }

   const uniqueHours = new Map();

   return agenda
     .filter((c: any) => {
       if (!uniqueHours.has(c.hora)) {
         uniqueHours.set(c.hora, true);
         return true;
       }
       return false;
     })
     .map((c: any) => ({
       id: c.id,
       fecha: c.fecha,
       hora: c.hora,
       tipo_servicio_id: c.tipo_servicio_id,
       servicio_id: c.servicio_id,
       sede_id: c.sede_id,
       estado: c.estado,
       apartado: c.apartado,
     }));
};
