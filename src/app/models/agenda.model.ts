export interface Agenda {
  id:number;
  fecha: Date;
  hora:string;
  tipo_servicio_id: number;
  servicio_id: string;
  sede_id: string;
  estado: string;
  apartado: string;  tiene_recargo: boolean;
  recargo: number | null;}

export interface AgendaRequest {
  tipo_servicio: number | undefined;
  servicio: any;
  sede: number;
  fecha: string | Date | undefined;
  hora: string;
  documento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  fecha_nacimiento?: string | Date | undefined;
  valor_abono: number;
}

export interface AgendaResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    transaction_id: string;
  };
}
