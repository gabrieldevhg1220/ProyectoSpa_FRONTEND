import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';
import { EmpleadoService } from '@core/services/empleado.service';
import { Empleado } from '@core/models/empleado'; // Asegúrate de importar el modelo Empleado

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  userRole: string | null = null;
  userName: string | null = null; // Nueva propiedad para el nombre

  constructor(
    private authService: AuthService,
    private router: Router,
    private empleadoService: EmpleadoService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.empleadoService.getEmpleadoById(parseInt(userId, 10)).subscribe({
        next: (empleado: Empleado) => {
          this.userRole = empleado.rol;
          this.userName = `${empleado.nombre} ${empleado.apellido}`; // Combinar nombre y apellido
        },
        error: (error) => {
          console.error('Error al cargar la información del usuario:', error);
          this.userRole = 'Administrador'; // Valor por defecto si falla
          this.userName = null;
        }
      });
    } else {
      this.userRole = 'Administrador';
      this.userName = null;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}