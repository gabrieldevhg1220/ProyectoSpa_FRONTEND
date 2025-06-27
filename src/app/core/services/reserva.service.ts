import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Reserva, Servicio, Cliente, Empleado } from '../models/reserva';
import { AuthService } from './auth.service';
import { environment } from '@environments/environment';

interface ReservaResponse {
  message?: string;
  data?: Reserva | { id: number };
}

interface ServicioResponse {
  id: number;
  nombre: string;
  descripcion: string;
  enum: string;
  precio: number;
}

interface ReservaRequest {
  clienteId: number;
  empleadoId: number;
  fechaReserva: string;
  servicios: { servicio: string; fechaServicio: string }[];
  status: string;
  medioPago: string;
  descuentoAplicado?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = `${environment.apiUrl}/api/reservas`;
  private adminApiUrl = `${environment.apiUrl}/api/admin/reservas`;
  private serviciosUrl = `${environment.apiUrl}/api/reservas/servicios`;
  private clienteApiUrl = `${environment.apiUrl}/api/clientes`;
  private profesionalApiUrl = `${environment.apiUrl}/api/profesional/reservas/hoy`;
  private historialApiUrl = `${environment.apiUrl}/api/profesional/clientes`;
  private recepcionistaApiUrl = `${environment.apiUrl}/api/recepcionista/reservas`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private getCreateReservaUrl(): string {
    const roles = this.authService.getRoles(); // Obtener roles del usuario desde AuthService
    if (roles.includes('ROLE_RECEPCIONISTA')) {
      return this.recepcionistaApiUrl;
    }
    return this.apiUrl; // Por defecto, usar /api/reservas para ROLE_CLIENTE u otros roles
  }

  getReservas(): Observable<Reserva[]> {
    const clienteId = this.authService.getUserId();
    if (!clienteId) {
      console.error('No se encontró clienteId. Asegúrate de estar autenticado.');
      throw new Error('No se encontró clienteId. Por favor, inicia sesión nuevamente.');
    }
    const url = `${this.clienteApiUrl}/${clienteId}/reservas`;
    return this.http.get<Reserva[]>(url, { headers: this.getHeaders() }).pipe(
      map(reservas => reservas.map(r => ({
        ...r,
        cliente: r.cliente || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' },
        empleado: r.empleado || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' },
        servicios: r.servicios || [{ id: 0, fechaServicio: '', servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' } }],
        pagos: r.pagos || []
      }))),
      tap(reservas => console.log('Reservas obtenidas:', reservas)),
      catchError(error => {
        console.error('Error al obtener reservas:', error);
        throw error;
      })
    );
  }

  createReserva(reserva: Reserva): Observable<Reserva> {
    const reservaToSend: ReservaRequest = {
      clienteId: reserva.cliente.id,
      empleadoId: reserva.empleado.id,
      fechaReserva: reserva.fechaReserva,
      servicios: reserva.servicios.map(s => ({
        servicio: s.servicio.enum, // Usar el enum como nombre temporalmente
        fechaServicio: s.fechaServicio
      })),
      status: reserva.status,
      medioPago: reserva.medioPago,
      descuentoAplicado: reserva.descuentoAplicado
    };
    const url = this.getCreateReservaUrl();
    return this.http.post<ReservaResponse>(url, reservaToSend, { headers: this.getHeaders() }).pipe(
      map(response => {
        const data = response.data;
        if (!data) {
          console.warn('Respuesta del backend no contiene data, usando reserva enviada como fallback');
          return { id: 0, cliente: reserva.cliente, empleado: reserva.empleado, fechaReserva: reserva.fechaReserva, status: reserva.status, medioPago: reserva.medioPago, servicios: reserva.servicios, pagos: [], descuentoAplicado: reserva.descuentoAplicado } as Reserva;
        }
        if ('id' in data && !('servicios' in data)) {
          console.warn('Respuesta del backend contiene solo un ID, usando servicios de la reserva enviada');
          return { ...data, servicios: reserva.servicios, descuentoAplicado: reserva.descuentoAplicado } as Reserva;
        }
        return data as Reserva;
      }),
      tap(reserva => console.log('Reserva creada:', reserva)),
      catchError(error => {
        console.error('Error al crear reserva:', error);
        let errorMessage = 'Error al crear la reserva. Por favor, intenta de nuevo más tarde.';
        if (error.status === 403) {
          errorMessage = 'No tienes permiso para crear reservas. Verifica tu rol o sesión.';
        } else if (error.status === 400) {
          errorMessage = 'Datos de la reserva inválidos. Verifica los campos e intenta nuevamente.';
        } else if (error.status === 500) {
          errorMessage = 'Error en el servidor. Por favor, contacta al administrador.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getAllReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.adminApiUrl, { headers: this.getHeaders() }).pipe(
      map(reservas => reservas.map(r => ({
        ...r,
        cliente: r.cliente || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' },
        empleado: r.empleado || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' },
        servicios: r.servicios || [{ id: 0, fechaServicio: '', servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' } }],
        pagos: r.pagos || []
      }))),
      catchError(error => {
        console.error('Error al obtener reservas:', error);
        throw error;
      })
    );
  }

  getReservasForRecepcionista(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.recepcionistaApiUrl, { headers: this.getHeaders() }).pipe(
      map(reservas => reservas.map(r => ({
        ...r,
        cliente: r.cliente || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' },
        empleado: r.empleado || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' },
        servicios: r.servicios || [{ id: 0, fechaServicio: '', servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' } }],
        pagos: r.pagos || []
      }))),
      catchError(error => {
        console.error('Error al obtener reservas para recepcionista:', error);
        throw error;
      })
    );
  }

  getReservasForProfesional(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.profesionalApiUrl, { headers: this.getHeaders() }).pipe(
      map(reservas => reservas.map(r => ({
        ...r,
        cliente: r.cliente || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' },
        empleado: r.empleado || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' },
        servicios: r.servicios || [{ id: 0, fechaServicio: '', servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' } }],
        pagos: r.pagos || []
      }))),
      catchError(error => {
        console.error('Error al obtener reservas para profesional:', error);
        throw error;
      })
    );
  }

  updateReserva(id: number, reserva: Reserva): Observable<Reserva> {
    const reservaToSend: ReservaRequest = {
      clienteId: reserva.cliente.id,
      empleadoId: reserva.empleado.id,
      fechaReserva: reserva.fechaReserva,
      servicios: reserva.servicios.map(s => ({
        servicio: s.servicio.enum, // Usar el enum como nombre temporalmente
        fechaServicio: s.fechaServicio
      })),
      status: reserva.status,
      medioPago: reserva.medioPago,
      descuentoAplicado: reserva.descuentoAplicado
    };
    const url = this.authService.isRecepcionista() ? `${this.recepcionistaApiUrl}/${id}` : `${this.adminApiUrl}/${id}`;
    return this.http.put<Reserva>(url, reservaToSend, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al actualizar reserva:', error);
        let errorMessage = 'Error al actualizar la reserva. Por favor, intenta de nuevo más tarde.';
        if (error.status === 403) {
          errorMessage = 'No tienes permiso para actualizar reservas.';
        } else if (error.status === 400) {
          errorMessage = 'Datos de la reserva inválidos. Verifica los campos e intenta nuevamente.';
        } else if (error.status === 404) {
          errorMessage = 'Reserva no encontrada.';
        } else if (error.status === 500) {
          errorMessage = 'Error en el servidor. Por favor, contacta al administrador.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  deleteReserva(id: number): Observable<void> {
    const url = this.authService.isRecepcionista() ? `${this.recepcionistaApiUrl}/${id}` : `${this.adminApiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al eliminar reserva:', error);
        throw error;
      })
    );
  }

  getServicios(): Observable<Servicio[]> {
    return this.http.get<ServicioResponse[]>(this.serviciosUrl, { headers: this.getHeaders() }).pipe(
      map(servicios => servicios.map(s => ({
        id: s.id,
        nombre: s.nombre,
        descripcion: s.descripcion || '',
        precio: s.precio || 0,
        enum: s.enum || '' // Asegurar que enum siempre esté presente
      }))),
      tap(servicios => console.log('Servicios obtenidos:', servicios)),
      catchError(error => {
        console.error('Error al obtener servicios:', error);
        throw error;
      })
    );
  }

  getServiciosEnums(): Observable<string[]> {
    return this.http.get<ServicioResponse[]>(this.serviciosUrl, { headers: this.getHeaders() }).pipe(
      map(servicios => servicios.map(s => s.enum)),
      tap(enums => console.log('Enums de servicios obtenidos:', enums)),
      catchError(error => {
        console.error('Error al obtener enums de servicios:', error);
        throw error;
      })
    );
  }

  getClienteHistorial(clienteId: number): Observable<Reserva[]> {
    const url = `${this.historialApiUrl}/${clienteId}/historial`;
    return this.http.get<Reserva[]>(url, { headers: this.getHeaders() }).pipe(
      map(reservas => reservas.map(r => ({
        ...r,
        cliente: r.cliente || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' },
        empleado: r.empleado || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' },
        servicios: r.servicios || [{ id: 0, fechaServicio: '', servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' } }],
        pagos: r.pagos || []
      }))),
      catchError(error => {
        console.error('Error al obtener el historial del cliente:', error);
        throw error;
      })
    );
  }
}