import { Cliente } from './cliente';
import { Empleado } from './empleado';

export interface Reserva {
  id: number;
  cliente: Cliente;
  empleado: Empleado;
  fechaReserva: string;
  servicio: string;
  status: string;
}