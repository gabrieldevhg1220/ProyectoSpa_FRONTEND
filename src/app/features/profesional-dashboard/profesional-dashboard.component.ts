import { Component, OnInit } from '@angular/core';
import { ReservaService } from '@core/services/reserva.service';
import { Reserva } from '@core/models/reserva';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@core/services/auth.service';
import { EmpleadoService } from '@core/services/empleado.service';
import { Empleado } from '@core/models/empleado'; // Asegúrate de importar el modelo Empleado

@Component({
  selector: 'app-profesional-dashboard',
  standalone: false,
  templateUrl: './profesional-dashboard.component.html',
  styleUrls: ['./profesional-dashboard.component.scss']
})
export class ProfesionalDashboardComponent implements OnInit {
  reservas: Reserva[] = [];
  fechaActual: string = new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: 'numeric', month: 'long', year: 'numeric' });
  rolProfesional: string | null = null;
  nombreProfesional: string | null = null; // Nueva propiedad para el nombre

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private empleadoService: EmpleadoService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadReservas();
    this.loadRolYNombreProfesional(); // Cambiado de loadRolProfesional
  }

  loadReservas(): void {
    this.reservaService.getReservasForProfesional().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
      },
      error: (error) => {
        console.error('Error al cargar las reservas:', error);
        let errorMessage = 'Error al cargar las reservas. Por favor, intenta de nuevo.';
        if (error.status === 403) {
          errorMessage = 'No tienes permisos para ver las reservas.';
        } else if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          this.authService.logout();
        }
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  loadRolYNombreProfesional(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.empleadoService.getEmpleadoById(parseInt(userId, 10)).subscribe({
        next: (empleado: Empleado) => {
          this.rolProfesional = empleado.rol;
          this.nombreProfesional = `${empleado.nombre} ${empleado.apellido}`; // Combinar nombre y apellido
        },
        error: (error) => {
          console.error('Error al cargar el rol y nombre del profesional:', error);
          this.toastr.error('Error al cargar el rol y nombre del profesional.', 'Error');
        }
      });
    }
  }

  simplificarRol(rol: string): string {
    switch (rol) {
      case 'ESTETICISTA':
        return 'Esteticista';
      case 'TECNICO_ESTETICA_AVANZADA':
        return 'Estetica Avanzada';
      case 'ESPECIALISTA_CUIDADO_UNAS':
        return 'Cuidado de Uñas';
      case 'MASAJISTA_TERAPEUTICO':
        return 'Masajista Terapeutico';
      case 'TERAPEUTA_SPA':
        return 'Terapeuta en Spa';
      case 'INSTRUCTOR_YOGA':
        return 'Instructor/a de Yoga';
      case 'NUTRICIONISTA':
        return 'Nutricionista';
      default:
        return rol;
    }
  }
}