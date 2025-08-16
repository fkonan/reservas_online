export interface TipoServicio {
  id: number;
  tipo_servicio: string;
}

export interface CategoriaServicio {
  id: number;
  categoria: string;
  servicios: Servicios[]; // Agregamos los servicios anidados
}

export interface Servicios {
  id: number;
  nombre_comercial: string;
  descripcion: string;
  duracion: string;
  recomendaciones: string;
  iconos: string;
  obsequio: string;
  imagen: string;
  categoria_id?:CategoriaServicio;
  sede_id: number;
  tipo_servicio_id?:TipoServicio;
}

export interface ServiciosResponse {
  success?: boolean;
  data: CategoriaServicio[];
  total_categorias?: number;
}
