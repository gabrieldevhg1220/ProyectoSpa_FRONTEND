import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfesionalGuard implements CanActivate {
  private readonly ROLES_PERMITIDOS = [
    'ESTETICISTA', 'TECNICO_ESTETICA_AVANZADA', 'ESPECIALISTA_CUIDADO_UNAS',
    'MASAJISTA_TERAPEUTICO', 'TERAPEUTA_SPA', 'INSTRUCTOR_YOGA', 'NUTRICIONISTA'
  ];

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.roles$.pipe(
      map(roles => {
        const tieneRolPermitido = roles.some(rol => {
          const rolSinPrefijo = rol.replace('ROLE_', '');
          return this.ROLES_PERMITIDOS.includes(rolSinPrefijo);
        });

        if (!tieneRolPermitido) {
          this.router.navigate(['/dashboard']);
          return false;
        }
        return true;
      })
    );
  }
}