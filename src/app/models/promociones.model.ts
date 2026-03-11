export interface PromocionItem {
  contenido: string;
  orden: number;
}

export interface Promocion {
  id: number;
  servicio: string | null;
  servicio_id: number;
  tipo_promocion: 'descuento' | 'precio_especial' | 'combo';
  titulo: string;
  subtitulo: string | null;
  precio_promocion: number | null;
  porcentaje_descuento: number | null;
  descripcion: string | null;
  imagen_url: string | null;
  boton_texto: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  orden: number;
  categoria: string | null;
  items: PromocionItem[];
}

export interface PromocionesResponse {
  success: boolean;
  data: Promocion[];
  total: number;
}
