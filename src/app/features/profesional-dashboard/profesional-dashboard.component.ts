import { Component, OnInit } from '@angular/core';
import { ReservaService } from '@core/services/reserva.service';
import { Reserva } from '@core/models/reserva';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@core/services/auth.service';
import { EmpleadoService } from '@core/services/empleado.service';
import { Empleado } from '@core/models/empleado';

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
  nombreProfesional: string | null = null;
  selectedReserva: Reserva | null = null;
  historial: string = '';
  clienteHistorial: Reserva[] = []; // Para almacenar el historial completo del cliente

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private empleadoService: EmpleadoService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadReservas();
    this.loadRolYNombreProfesional();
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
          this.nombreProfesional = `${empleado.nombre} ${empleado.apellido}`;
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

  selectReserva(reserva: Reserva): void {
    this.selectedReserva = { ...reserva };
    this.historial = this.selectedReserva.historial || '';
    this.loadClienteHistorial(reserva.cliente.id); // Cargar el historial completo del cliente
  }

  loadClienteHistorial(clienteId: number): void {
    this.reservaService.getClienteHistorial(clienteId).subscribe({
      next: (historial) => {
        this.clienteHistorial = historial;
      },
      error: (error) => {
        console.error('Error al cargar el historial del cliente:', error);
        this.toastr.error('Error al cargar el historial del cliente.', 'Error');
      }
    });
  }

  saveHistorial(): void {
    if (this.selectedReserva && this.historial.trim()) {
      const updatedReserva = { ...this.selectedReserva, historial: this.historial };
      this.reservaService.updateReserva(this.selectedReserva.id, updatedReserva).subscribe({
        next: () => {
          const index = this.reservas.findIndex(r => r.id === this.selectedReserva!.id);
          if (index !== -1) {
            this.reservas[index] = { ...this.selectedReserva!, historial: this.historial };
          }
          this.loadClienteHistorial(this.selectedReserva!.cliente.id); // Actualizar el historial completo
          this.toastr.success('Historial guardado exitosamente.', 'Éxito');
          this.selectedReserva = null;
          this.historial = '';
        },
        error: (error) => {
          console.error('Error al guardar el historial:', error);
          this.toastr.error('Error al guardar el historial. Por favor, intenta de nuevo.', 'Error');
        }
      });
    } else {
      this.toastr.error('Por favor, ingresa un historial.', 'Error');
    }
  }

  cancelEdit(): void {
    this.selectedReserva = null;
    this.historial = '';
    this.clienteHistorial = [];
  }
}