import { Reserva } from './reserva';

export interface ReservaResponse {
  message: string;
  data?: Reserva | { id: number };
}