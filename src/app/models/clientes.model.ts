export interface Clientes {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  fecha_nacimiento: Date | null;
  whatsapp: string | null;
  correo: string;
  direccion: string;
  estado: boolean;
}
