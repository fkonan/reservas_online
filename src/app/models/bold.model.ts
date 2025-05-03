export interface GetLinkRequest {
  tipo_servicio: number;
  servicio: number;
  sede: number;
  fecha: Date;
  hora: string;
  documento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  valor_abono: number;
}
