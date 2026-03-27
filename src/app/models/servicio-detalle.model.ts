export type TipoSeccion =
  | 'descripcion'
  | 'recomendaciones'
  | 'beneficios'
  | 'promocion'
  | 'garantia'
  | 'diagnostico'
  | 'tribu_vip'
  | 'consideraciones_tecnicas'
  | 'obsequios'
  | 'texto_libre'
  | 'faq'
  | 'cta_secundario'
  | 'video'
  | 'galeria'
  | 'advertencias'
  | 'precios_referencia'
  | 'imagen';

export interface AtributoServicio {
  id: number;
  nombre: string;
  slug: string;
  icono: string | null;
  descripcion: string | null;
}

export interface SeccionWeb {
  id: number;
  tipo_seccion: TipoSeccion;
  titulo: string | null;
  subtitulo: string | null;
  contenido_json: Record<string, any>;
  orden: number;
  usa_acordeon: boolean;
}

export interface ServicioWebConfig {
  id: number;
  slug: string;
  titulo_publico: string;
  subtitulo: string | null;
  descripcion_corta: string | null;
  imagen_portada: string | null;
  texto_boton_agenda: string;
  mostrar_agenda: boolean;
  published: boolean;
  duracion: string | null;
  secciones: SeccionWeb[];
}

export interface ServicioDetalle {
  id: number;
  servicio: string;
  nombre_comercial: string;
  duracion: string;
  tipo_servicio_id: number;
  categoria_id: number;
  web: ServicioWebConfig;
  atributos: AtributoServicio[];
}

export interface ApiResponseServicio {
  success: boolean;
  data: ServicioDetalle;
}
