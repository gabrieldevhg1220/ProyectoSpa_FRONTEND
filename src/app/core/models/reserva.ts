// Interfaz para Servicio
export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  enum: string; // Obligatorio y siempre inicializado
}

// Interfaz para ReservaServicio
export interface ReservaServicio {
  id: number;
  fechaServicio: string;
  servicio: Servicio; // Asegurar que servicio incluya enum
}

// Interfaz para Pago
export interface Pago {
  id: number;
  montoTotal: number;
  medioPago: string;
  fechaPago: string;
  descuentoAplicado?: number;
}

export interface Reserva {
  id: number;
  cliente: Cliente;
  empleado: Empleado;
  fechaReserva: string;
  status: string;
  medioPago: string;
  descuentoAplicado?: number;
  historial?: string;
  servicios: ReservaServicio[];
  pagos: Pago[];
}

// Interfaz para Cliente
export interface Cliente {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password?: string;
}

// Interfaz para Empleado
export interface Empleado {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string;
}