import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Reserva } from '../models/reserva';
import { AuthService } from './auth.service';
import { environment } from '@environments/environment';
import { Servicio } from '../models/servicio';

// Se define una interfaz para la respuesta del backend
interface ReservaResponse {
  message?: string;
  data?: Reserva;
}

// Interfaz para la respuesta del endpoint /api/reservas/servicios
interface ServicioResponse {
  nombre: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = `${environment.apiUrl}/api/clientes/reservas`;
  private adminApiUrl = `${environment.apiUrl}/api/admin/reservas`;
  private serviciosUrl = `${environment.apiUrl}/api/reservas/servicios`;
  private clienteApiUrl = `${environment.apiUrl}/api/clientes`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Métodos para Clientes
  getReservas(): Observable<Reserva[]> {
    const clienteId = this.authService.getUserId();
    if (!clienteId) {
      console.error('No se encontró clienteId. Asegúrate de estar autenticado.');
      throw new Error('No se encontró clienteId. Por favor, inicia sesión nuevamente.');
    }
    const url = `${environment.apiUrl}/api/clientes/${clienteId}/reservas`;
    return this.http.get<Reserva[]>(url, { headers: this.getHeaders() }).pipe(
      tap(reservas => console.log('Reservas obtenidas:', reservas)),
      catchError(error => {
        console.error('Error al obtener reservas:', error);
        throw error;
      })
    );
  }

  createReserva(reserva: any): Observable<Reserva> {
  return this.http.post<ReservaResponse>(this.apiUrl, reserva, { headers: this.getHeaders() }).pipe(
    map(response => response.data || response as unknown as Reserva),
    tap(reserva => console.log('Reserva creada:', reserva)),
    catchError(error => {
      console.error('Error al crear reserva:', error);
      let errorMessage = 'Error al crear la reserva. Por favor, intenta de nuevo más tarde.';
      if (error.status === 403) {
        errorMessage = 'No tienes permiso para crear reservas.';
      } else if (error.status === 400) {
        errorMessage = 'Datos de la reserva inválidos. Verifica los campos e intenta nuevamente.';
      } else if (error.status === 500) {
        errorMessage = 'Error en el servidor. Por favor, contacta al administrador.';
      }
      return throwError(() => new Error(errorMessage));
    })
  );
}

  // Métodos para los Administradores o empleados que tengan el rol de GERENTE_GENERAL
  getAllReservas(): Observable<Reserva[]> {
    const headers = this.getHeaders();
    console.log('Token enviado:', headers.get('Authorization')); // Verifica el token
    return this.http.get<Reserva[]>(this.adminApiUrl, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al obtener reservas:', error);
        throw error;
      })
    );
  }

  // Metodo para mostrar lista de reservas a RECEPCIONISTA.
  recepcionistaApiUrl = `${environment.apiUrl}/api/recepcionista/reservas`;
  getReservasForRecepcionista(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.recepcionistaApiUrl, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al obtener reservas para recepcionista:', error);
        throw error;
      })
    );
  }

  updateReserva(id: number, reserva: any): Observable<Reserva> {
    const url = this.authService.isRecepcionista() ? `${this.recepcionistaApiUrl}/${id}` : `${this.adminApiUrl}/${id}`;
    console.log('URL usada para updateReserva:', url); // Para depurar
    return this.http.put<Reserva>(url, reserva, { headers: this.getHeaders() }).pipe(
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
    console.log('URL usada para deleteReserva:', url); // Para depurar
    return this.http.delete<void>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al eliminar reserva:', error);
        throw error;
      })
    );
  }

  getServicios(): Observable<{ nombre: string, enum: string }[]> {
    return this.http.get<ServicioResponse[]>(this.serviciosUrl, { headers: this.getHeaders() }).pipe(
      map(servicios => servicios.map(s => ({
        nombre: s.descripcion, // Usar la descripción como nombre visible
        enum: s.nombre // Usar el nombre como valor del enum
      }))),
      tap(servicios => console.log('Servicios obtenidos:', servicios)),
      catchError(error => {
        console.error('Error al obtener servicios:', error);
        throw error;
      })
    );
  }

  // Método alternativo para obtener solo los valores de enum como string[]
  getServiciosEnums(): Observable<string[]> {
    return this.http.get<ServicioResponse[]>(this.serviciosUrl, { headers: this.getHeaders() }).pipe(
      map(servicios => servicios.map(s => s.nombre)),
      tap(enums => console.log('Enums de servicios obtenidos:', enums)),
      catchError(error => {
        console.error('Error al obtener enums de servicios:', error);
        throw error;
      })
    );
  }
}