export interface TipoServicio {
  id: number;
  tipo_servicio: string;
  valor_abono: number;
}

export interface Servicios {
  id: number;
  servicio: string;
  tipo_servicio_id: number;
  nombre_comercial: string;
  descripcion: string;
  duracion: string;
  tipo_servicio?: TipoServicio;
  sede_id:number;
  recomendaciones:string;
}
