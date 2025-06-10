import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private tokenKey = 'auth-token';
  private userIdKey = 'user-id';
  private rolesSubject = new BehaviorSubject<string[]>([]); // Almacena los roles
  roles$ = this.rolesSubject.asObservable(); // Observable para los roles
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Cargar el token y los roles del localStorage al inicializar
    this.loadAuthData();
  }

  private loadAuthData(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userId = localStorage.getItem(this.userIdKey);
    if (token) {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userIdKey, userId || '');
      const roles = this.extractRolesFromToken(token);
      this.rolesSubject.next(roles);
      this.isLoggedInSubject.next(true);
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        console.log('Respuesta del login:', response);
        if (response.jwt) {
          localStorage.setItem(this.tokenKey, response.jwt);
          const userId = response.userId;
          if (userId) {
            localStorage.setItem(this.userIdKey, userId);
          } else {
            console.error('No se encontró userId en la respuesta del login');
          }
          // Extraer los roles del token y actualizar el BehaviorSubject
          const roles = this.extractRolesFromToken(response.jwt);
          this.rolesSubject.next(roles);
          console.log('Datos almacenados en localStorage:', {
            token: localStorage.getItem(this.tokenKey),
            userId: localStorage.getItem(this.userIdKey),
            roles: roles
          });
          this.isLoggedInSubject.next(true);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
        if (error.status === 401) {
          errorMessage = 'Correo o contraseña incorrectos.';
        } else if (error.status === 404) {
          errorMessage = 'El correo no está registrado.';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message; // Usar mensaje del backend si está disponible
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  register(userData: { dni: string, nombre: string, apellido: string, email: string, password: string, telefono: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error al registrar. Por favor, intenta de nuevo.';
        if (error.status === 400 && error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    this.rolesSubject.next([]);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    console.log('Recuperando token desde localStorage:', token);
    return token;
  }

  getUserId(): string | null {
    const userId = localStorage.getItem(this.userIdKey);
    console.log('Recuperando userId desde localStorage:', userId);
    return userId;
  }

  // Extraer los roles del token JWT
  private extractRolesFromToken(token: string): string[] {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roles || [];
    } catch (e) {
      console.error('Error al decodificar el token JWT:', e);
      return [];
    }
  }

  // Método para obtener el rol principal en el formato esperado (sin "ROLE_")
  getPrimaryRole(): string | null {
    const roles = this.rolesSubject.getValue();
    if (roles.length > 0) {
      // Tomar el primer rol y quitar el prefijo "ROLE_"
      return roles[0].replace('ROLE_', '');
    }
    return null;
  }

  isGerenteGeneral(): boolean {
    const roles = this.rolesSubject.getValue();
    return roles.includes('ROLE_GERENTE_GENERAL');
  }

  isRecepcionista(): boolean {
    const roles = this.rolesSubject.getValue();
    console.log('Verificando isRecepcionista, roles:', roles);
    return roles.includes('ROLE_RECEPCIONISTA');
  }

  // Nuevo método para verificar si el usuario es un profesional
  isProfesional(): boolean {
    const roles = this.rolesSubject.getValue();
    const profesionalRoles = [
      'ROLE_ESTETICISTA',
      'ROLE_TECNICO_ESTETICA_AVANZADA',
      'ROLE_ESPECIALISTA_CUIDADO_UNAS',
      'ROLE_MASAJISTA_TERAPEUTICO',
      'ROLE_TERAPEUTA_SPA',
      'ROLE_INSTRUCTOR_YOGA',
      'ROLE_NUTRICIONISTA'
    ];
    return roles.some(role => profesionalRoles.includes(role));
  }
}