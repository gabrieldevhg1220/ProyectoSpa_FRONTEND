import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Empleado } from '../models/empleado';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private apiUrl = `${environment.apiUrl}/api/empleados`;
  private reservasApiUrl = `${environment.apiUrl}/api/empleados/reservas`;
  private rolesApiUrl = `${environment.apiUrl}/api/roles`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllEmpleados(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.reservasApiUrl, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al obtener la lista de empleados:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        let errorMessage = 'Error al cargar la lista de empleados. Por favor, intenta de nuevo más tarde.';
        if (error.status === 403) {
          errorMessage = 'No tienes permiso para acceder a la lista de empleados.';
        } else if (error.status === 401) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 500) {
          errorMessage = 'Error en el servidor. Por favor, contacta al administrador.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getAllRoles(): Observable<string[]> {
    return this.http.get<string[]>(this.rolesApiUrl, { headers: this.getHeaders() }).pipe(
        catchError((error) => {
            console.error('Error al obtener la lista de roles:', {
                status: error.status,
                statusText: error.statusText,
                message: error.message,
                error: error.error
            });
            let errorMessage = 'Error al cargar la lista de roles. Por favor, intenta de nuevo más tarde.';
            if (error.status === 403) {
                errorMessage = 'No tienes permiso para acceder a la lista de roles.';
            } else if (error.status === 401) {
                errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
            } else if (error.status === 500) {
                errorMessage = 'Error en el servidor. Por favor, contacta al administrador.';
            }
            return throwError(() => new Error(errorMessage));
        })
    );
}

  getEmpleadosForReservas(): Observable<Empleado[]> {
    console.log('Solicitando empleados para reservas desde:', this.reservasApiUrl);
    return this.http.get<Empleado[]>(this.reservasApiUrl, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al obtener la lista de empleados para reservas:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        let errorMessage = 'Error al cargar la lista de empleados para reservas. Por favor, intenta de nuevo más tarde.';
        if (error.status === 403) {
          errorMessage = 'No tienes permiso para acceder a la lista de empleados.';
        } else if (error.status === 401) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 500) {
          errorMessage = 'Error en el servidor. Por favor, contacta al administrador.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getEmpleadoById(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al obtener el empleado:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        let errorMessage = 'Error al obtener el empleado. Por favor, intenta de nuevo más tarde.';
        if (error.status === 403) {
          errorMessage = 'No tienes permiso para acceder a este empleado.';
        } else if (error.status === 401) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 404) {
          errorMessage = 'Empleado no encontrado.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  createEmpleado(empleado: Empleado): Observable<Empleado> {
    return this.http.post<Empleado>(this.apiUrl, empleado, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al crear el empleado:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        let errorMessage = 'Error al crear el empleado. Por favor, intenta de nuevo más tarde.';
        if (error.status === 403) {
          errorMessage = 'No tienes permiso para crear empleados.';
        } else if (error.status === 401) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 400) {
          errorMessage = error.error.message || 'Datos inválidos. Verifica los campos e intenta de nuevo.';
        } else if (error.status === 500) {
          errorMessage = 'Error en el servidor. Por favor, contacta al administrador.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateEmpleado(id: number, empleado: Empleado): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.apiUrl}/${id}`, empleado, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al actualizar el empleado:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        let errorMessage = 'Error al actualizar el empleado. Por favor, intenta de nuevo más tarde.';
        if (error.status === 403) {
          errorMessage = 'No tienes permiso para actualizar empleados.';
        } else if (error.status === 401) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 404) {
          errorMessage = 'Empleado no encontrado.';
        } else if (error.status === 400) {
          errorMessage = error.error.message || 'Datos inválidos. Verifica los campos e intenta de nuevo.';
        } else if (error.status === 500) {
          errorMessage = 'Error en el servidor. Por favor, contacta al administrador.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  deleteEmpleado(id: number): Observable<any> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al eliminar el empleado:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        let errorMessage = 'Error al eliminar el empleado. Por favor, intenta de nuevo más tarde.';
        if (error.status === 403) {
          errorMessage = 'No tienes permiso para eliminar empleados.';
        } else if (error.status === 401) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 404) {
          errorMessage = 'Empleado no encontrado.';
        } else if (error.status === 500) {
          errorMessage = 'Error en el servidor. Por favor, contacta al administrador.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}