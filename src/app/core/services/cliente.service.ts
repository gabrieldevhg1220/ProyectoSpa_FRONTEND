import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Cliente } from '../models/cliente';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/api/admin/clientes`;
  private recepcionistaApiUrl = `${environment.apiUrl}/api/recepcionista/clientes`;
  private clienteApiUrl = `${environment.apiUrl}/api/clientes`;
  private clientesCache: Cliente[] = [];

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getClientes(): Observable<Cliente[]> {
    const url = this.authService.isRecepcionista() ? this.recepcionistaApiUrl : this.apiUrl;
    console.log('URL usada para getClientes:', url);
    return this.http.get<Cliente[]>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al obtener clientes:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        let errorMessage = 'Error al cargar la lista de clientes. Por favor, intenta de nuevo más tarde.';
        if (error.status === 403) {
          errorMessage = 'No tienes permiso para acceder a la lista de clientes.';
        } else if (error.status === 401) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 500) {
          errorMessage = 'Error en el servidor. Por favor, contacta al administrador.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getCliente(id: number): Observable<Cliente> {
    const url = this.authService.isRecepcionista() ? `${this.recepcionistaApiUrl}/${id}` : `${this.apiUrl}/${id}`;
    console.log('URL usada para getCliente:', url);
    return this.http.get<Cliente>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al obtener cliente:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        let errorMessage = 'Error al obtener el cliente. Por favor, intenta de nuevo más tarde.';
        if (error.status === 403) {
          errorMessage = 'No tienes permiso para acceder a este cliente.';
        } else if (error.status === 401) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 404) {
          errorMessage = 'Cliente no encontrado.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getClienteByToken(): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.clienteApiUrl}/actual`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al obtener datos del cliente autenticado:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        let errorMessage = 'Error al obtener los datos del cliente autenticado. Por favor, intenta de nuevo más tarde.';
        if (error.status === 403) {
          errorMessage = 'No tienes permiso para acceder a los datos del cliente.';
        } else if (error.status === 401) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 404) {
          errorMessage = 'Cliente no encontrado.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al crear cliente:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        let errorMessage = 'Error al crear el cliente. Por favor, intenta de nuevo más tarde.';
        if (error.status === 403) {
          errorMessage = 'No tienes permiso para crear clientes.';
        } else if (error.status === 401) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Datos inválidos. Verifica los campos e intenta de nuevo.';
        } else if (error.status === 500) {
          errorMessage = 'Error en el servidor. Por favor, contacta al administrador.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateCliente(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al actualizar cliente:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        let errorMessage = 'Error al actualizar el cliente. Por favor, intenta de nuevo más tarde.';
        if (error.status === 403) {
          errorMessage = 'No tienes permiso para actualizar clientes.';
        } else if (error.status === 401) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 404) {
          errorMessage = 'Cliente no encontrado.';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Datos inválidos. Verifica los campos e intenta de nuevo.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al eliminar cliente:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        let errorMessage = 'Error al eliminar el cliente. Por favor, intenta de nuevo más tarde.';
        if (error.status === 403) {
          errorMessage = 'No tienes permiso para eliminar clientes.';
        } else if (error.status === 401) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 404) {
          errorMessage = 'Cliente no encontrado.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}