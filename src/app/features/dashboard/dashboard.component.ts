import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ReservaService } from '@core/services/reserva.service';
import { EmpleadoService } from '@core/services/empleado.service';
import { Reserva } from '@core/models/reserva';
import { Cliente } from '@core/models/cliente';
import { Empleado } from '@core/models/empleado';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  userRole: string | null = null;
  userType: string | null = null;
  reservas: Reserva[] = [];
  servicios: string[] = [];
  empleados: any[] = [];
  nuevaReserva: Reserva = {
    id: 0,
    cliente: {} as Cliente,
    empleado: {} as Empleado,
    fechaReserva: '',
    servicio: '',
    status: 'PENDIENTE',
    medioPago: 'EFECTIVO' // Añadir medioPago
  };

  selectedEmpleadoId: number | null = null;

  constructor(
    private authService: AuthService,
    private reservaService: ReservaService,
    private empleadoService: EmpleadoService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getPrimaryRole();
    this.loadReservas();
    this.loadServicios();
    this.loadEmpleados();

    // Redirigir a /reserva solo si el usuario NO es GERENTE_GENERAL ni RECEPCIONISTA
    if (!this.authService.isGerenteGeneral() && !this.authService.isRecepcionista()) {
      this.router.navigate(['/reserva']);
    }
    return; // Salir de ngOnInit para evitar cargar datos innecesarios

    // Cargar lista de empleados solo si el usuario tiene el rol adecuado
    if (this.authService.isGerenteGeneral() || this.authService.isRecepcionista()) {
      this.empleadoService.getAllEmpleados().subscribe({
        next: (empleados) => {
          this.empleados = empleados;
          if (empleados.length > 0) {
            this.toastr.success('Lista de empleados cargada correctamente.', 'Éxito');
          } else {
            this.toastr.info('No hay empleados disponibles.', 'Información');
          }
        },
        error: (error) => {
          console.error('Error al cargar los empleados:', error);
          this.toastr.error(error.message || 'Error al cargar los empleados.', 'Error');
        }
      });
    }
  }

  loadReservas(): void {
    this.reservaService.getReservas().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        if (reservas.length > 0) {
          this.toastr.success('Reservas cargadas correctamente', 'Éxito');
        } else {
          this.toastr.info('No tienes reservas actualmente', 'Información');
        }
      },
      error: (error) => {
        console.error('Error al cargar las reservas:', error);
        this.toastr.error('Error al cargar tus reservas. Por favor, intenta de nuevo.', 'Error');
      }
    });
  }

  loadServicios(): void {
    this.reservaService.getServiciosEnums().subscribe({
      next: (servicios) => {
        this.servicios = servicios;
      },
      error: (error) => {
        console.error('Error al cargar los servicios:', error);
        this.toastr.error('Error al cargar los servicios: ' + (error.message || 'Por favor, intenta de nuevo.'));
      }
    });
  }

  loadEmpleados(): void {
    this.empleadoService.getAllEmpleados().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
        console.log('Empleados cargados:', empleados); // Agregar log para depurar
      },
      error: (error) => {
        console.error('Error al cargar los empleados:', error);
        this.toastr.error('Error al cargar la lista de empleados: ' + (error.statusText || 
        error.message || 'Por favor, intenta de nuevo.'));
      }
    });
  }

  createReserva(): void {
    const clienteId = this.authService.getUserId();
    console.log('Cliente ID al intentar crear reserva:', clienteId);
    console.log('Rol del usuario:', this.authService.getPrimaryRole());
    console.log('Token:', this.authService.getToken());

    if (!clienteId) {
      this.toastr.error('Debes iniciar sesión para crear una reserva.', 'Error');
      return;
    }

    if (!this.nuevaReserva.servicio || !this.nuevaReserva.fechaReserva || !this.selectedEmpleadoId || !this.nuevaReserva.medioPago) {
      this.toastr.error('Por favor, completa todos los campos requeridos.', 'Error');
      return;
    }

    const reservaData = {
      cliente: { id: clienteId },
      empleado: { id: this.selectedEmpleadoId },
      fechaReserva: this.nuevaReserva.fechaReserva,
      servicio: this.nuevaReserva.servicio,
      status: 'PENDIENTE',
      medioPago: this.nuevaReserva.medioPago // Añadir medioPago
    };
    
    console.log('Enviando datos de reserva:', reservaData);

    this.reservaService.createReserva(reservaData).subscribe({
      next: (response: any) => {
        this.toastr.success(response.message || 'Reserva creada exitosamente', 'Éxito');

        const empleadoSeleccionado = this.empleados.find(emp => emp.id === this.selectedEmpleadoId);

        const clienteSimulado: Cliente = {
          id: parseInt(clienteId, 10),
          dni: '',
          nombre: '',
          apellido: '',
          email: '',
          telefono: ''
        };

        const nuevaReservaCompleta: Reserva = {
          id: response.data?.id || Date.now(),
          cliente: clienteSimulado,
          empleado: empleadoSeleccionado || {
            id: this.selectedEmpleadoId,
            dni: '',
            nombre: 'Desconocido',
            apellido: '',
            email: '',
            telefono: '',
            rol: ''
          },
          fechaReserva: this.nuevaReserva.fechaReserva,
          servicio: this.nuevaReserva.servicio,
          status: 'PENDIENTE',
          medioPago: this.nuevaReserva.medioPago // Añadir medioPago
        };
        this.reservas.push(nuevaReservaCompleta);

        this.nuevaReserva = {
          id: 0,
          cliente: { dni: '', nombre: '', apellido: '', email: '', telefono: '' } as Cliente,
          empleado: { dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' } as Empleado,
          fechaReserva: '',
          servicio: '',
          status: 'PENDIENTE',
          medioPago: 'EFECTIVO' // Añadir medioPago
        };
        this.selectedEmpleadoId = null;
      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
        this.toastr.error(error.error?.message || 'Error al crear la reserva. Por favor, intenta de nuevo.', 'Error');
      }
    });
  }

  // Método para convertir roles a formato legible
  getReadableRole(rol: string): string {
    // Eliminar el prefijo ROLE_ si existe
    const cleanedRole = rol.startsWith('ROLE_') ? rol.replace('ROLE_', '') : rol;
    const roleMap: { [key: string]: string } = {
      'ESTETICISTA': 'Esteticista',
      'TECNICO_ESTETICA_AVANZADA': 'Técnico en Estética Avanzada',
      'ESPECIALISTA_CUIDADO_UNAS': 'Especialista en Cuidado de Uñas',
      'MASAJISTA_TERAPEUTICO': 'Masajista Terapéutico',
      'TERAPEUTA_SPA': 'Terapeuta Spa',
      'COORDINADOR_AREA': 'Coordinador de Área',
      'RECEPCIONISTA': 'Recepcionista',
      'GERENTE_GENERAL': 'Gerente General',
      'INSTRUCTOR_YOGA': 'Instructor Yoga',
      'NUTRICIONISTA': 'Nutricionista'
    };
    return roleMap[cleanedRole] || cleanedRole;
  }
}