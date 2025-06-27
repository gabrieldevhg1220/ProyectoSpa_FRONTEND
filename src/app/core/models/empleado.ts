export interface Empleado {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  telefono: string;
  rol: string;
}