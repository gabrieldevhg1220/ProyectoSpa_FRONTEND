import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ReservaService } from '@core/services/reserva.service';
import { ClienteService } from '@core/services/cliente.service';
import { EmpleadoService } from '@core/services/empleado.service';
import { AuthService } from '@core/services/auth.service';
import { Reserva } from '@core/models/reserva';
import { Cliente } from '@core/models/cliente';
import { Empleado } from '@core/models/empleado';
import { Servicio } from '@core/models/servicio';

@Component({
  selector: 'app-admin-reservas',
  standalone: false,
  templateUrl: './admin-reservas.component.html',
  styleUrls: ['./admin-reservas.component.scss']
})
export class AdminReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  filteredReservas: Reserva[] = []; // Nueva lista para el filtrado
  clientes: Cliente[] = [];
  empleados: Empleado[] = [];
  servicios: { nombre: string; enum: string }[] = [];
  newReserva: Reserva = {
    id: 0,
    cliente: {} as Cliente,
    empleado: {} as Empleado,
    fechaReserva: '',
    servicio: '',
    status: 'PENDIENTE'
  };
  editingReserva: Reserva | null = null;
  selectedClienteId: number | null = null;
  selectedEmpleadoId: number | null = null;
  filterDni: string = ''; // Nueva propiedad para el filtro por DNI

  constructor(
    private reservaService: ReservaService,
    private clienteService: ClienteService,
    private empleadoService: EmpleadoService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isGerenteGeneral()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadReservas();
    this.loadClientes();
    this.loadEmpleados();
    this.loadServicios();
    // No llamar a updateEmpleadosByServicio al inicio, solo tras seleccionar un servicio
    if (this.servicios.length > 0) {
      this.toastr.success('Se cargó exitosamente la lista de servicios.', 'Éxito');
    }
  }

  loadReservas(): void {
    this.reservaService.getAllReservas().subscribe({
      next: (data) => {
        this.reservas = data;
        this.filteredReservas = [...this.reservas]; // Inicializar filteredReservas con todas las reservas
        if (data.length === 0) {
          this.toastr.info('No hay reservas registradas.', 'Información');
        }
        this.applyFilters(); // Aplicar filtros al cargar
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error al cargar las reservas.', 'Error');
        console.error('Error al cargar reservas:', error);
        if (error.message.includes('No estás autenticado')) {
          this.authService.logout();
        }
      }
    });
  }

  loadClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        if (clientes.length === 0) {
          this.toastr.info('No hay clientes disponibles.', 'Información');
        }
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error al cargar los clientes.', 'Error');
        console.error('Error al cargar clientes:', error);
        if (error.message.includes('No estás autenticado')) {
          this.authService.logout();
        }
      }
    });
  }

  loadEmpleados(): void {
    this.empleadoService.getAllEmpleados().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
        if (empleados.length === 0) {
          this.toastr.info('No hay empleados disponibles.', 'Información');
        }
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error al cargar los empleados.', 'Error');
        console.error('Error al cargar empleados:', error);
        if (error.message.includes('No estás autenticado')) {
          this.authService.logout();
        }
      }
    });
  }

  loadServicios(): void {
    this.reservaService.getServicios().subscribe({
      next: (servicios) => {
        this.servicios = servicios;
        if (servicios.length === 0) {
          this.toastr.info('No hay servicios disponibles.', 'Información');
        }
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error al cargar los servicios.', 'Error');
        console.error('Error al cargar servicios:', error);
      }
    });
  }

  createReserva(): void {
    if (!this.selectedClienteId || !this.selectedEmpleadoId) {
      this.toastr.error('Por favor, selecciona un cliente y un empleado.', 'Error');
      return;
    }

    const reservaData = {
      cliente: { id: this.selectedClienteId },
      empleado: { id: this.selectedEmpleadoId },
      fechaReserva: this.newReserva.fechaReserva,
      servicio: this.newReserva.servicio,
      status: this.newReserva.status
    };

    this.reservaService.createReserva(reservaData).subscribe({
      next: (newReserva) => {
        const clienteSeleccionado = this.clientes.find(c => c.id === this.selectedClienteId);
        const empleadoSeleccionado = this.empleados.find(e => e.id === this.selectedEmpleadoId);

        const reservaCompleta: Reserva = {
          ...newReserva,
          cliente: clienteSeleccionado || { id: this.selectedClienteId, dni: '', nombre: 'Desconocido', apellido: '', email: '', telefono: '' },
          empleado: empleadoSeleccionado || { id: this.selectedEmpleadoId, dni: '', nombre: 'Desconocido', apellido: '', email: '', telefono: '', rol: '' }
        };

        this.reservas.push(reservaCompleta);
        this.filteredReservas = [...this.reservas]; // Actualizar la lista filtrada
        this.applyFilters(); // Reaplicar filtros
        this.toastr.success('Reserva creada exitosamente.', 'Éxito');
        this.resetForm();
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error al crear la reserva.', 'Error');
        console.error('Error al crear reserva:', error);
        if (error.message.includes('No estás autenticado')) {
          this.authService.logout();
        }
      }
    });
  }

  editReserva(reserva: Reserva): void {
    this.editingReserva = { ...reserva };
    const modalElement = document.getElementById('editReservaModal') as HTMLElement;
    if (modalElement) {
      const modalInstance = new (window as any).bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  updateReserva(): void {
    if (this.editingReserva) {
      const updatedReserva = {
        ...this.editingReserva,
        cliente: { id: this.editingReserva.cliente.id },
        empleado: { id: this.editingReserva.empleado.id }
      };

      this.reservaService.updateReserva(this.editingReserva.id, updatedReserva).subscribe({
        next: (reserva) => {
          const index = this.reservas.findIndex(r => r.id === reserva.id);
          if (index !== -1) {
            const clienteSeleccionado = this.clientes.find(c => c.id === this.editingReserva!.cliente.id);
            const empleadoSeleccionado = this.empleados.find(e => e.id === this.editingReserva!.empleado.id);
            this.reservas[index] = {
              ...reserva,
              cliente: clienteSeleccionado || this.editingReserva!.cliente,
              empleado: empleadoSeleccionado || this.editingReserva!.empleado
            };
            this.filteredReservas = [...this.reservas]; // Actualizar la lista filtrada
            this.applyFilters(); // Reaplicar filtros
          }
          this.toastr.success('Reserva actualizada exitosamente.', 'Éxito');
          this.editingReserva = null;
          const modalElement = document.getElementById('editReservaModal') as HTMLElement;
          if (modalElement) {
            const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
          }
        },
        error: (error) => {
          this.toastr.error(error.message || 'Error al actualizar la reserva.', 'Error');
          console.error('Error al actualizar reserva:', error);
          if (error.message.includes('No estás autenticado')) {
            this.authService.logout();
          }
        }
      });
    }
  }

  deleteReserva(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      this.reservaService.deleteReserva(id).subscribe({
        next: () => {
          this.reservas = this.reservas.filter(reserva => reserva.id !== id);
          this.filteredReservas = [...this.reservas]; // Actualizar la lista filtrada
          this.applyFilters(); // Reaplicar filtros
          this.toastr.success('Reserva eliminada exitosamente.', 'Éxito');
        },
        error: (error) => {
          this.toastr.error(error.message || 'Error al eliminar la reserva.', 'Error');
          console.error('Error al eliminar reserva:', error);
          if (error.message.includes('No estás autenticado')) {
            this.authService.logout();
          }
        }
      });
    }
  }

  resetForm(): void {
    this.newReserva = {
      id: 0,
      cliente: {} as Cliente,
      empleado: {} as Empleado,
      fechaReserva: '',
      servicio: '',
      status: 'PENDIENTE'
    };
    this.selectedClienteId = null;
    this.selectedEmpleadoId = null;
  }

  applyFilters(): void {
    this.filteredReservas = this.reservas.filter(reserva => {
      const clienteDni = reserva.cliente.dni || '';
      const matchesDni = this.filterDni ? clienteDni.toLowerCase().includes(this.filterDni.toLowerCase()) : true;
      return matchesDni;
    });
  }

  clearFilter(): void {
    this.filterDni = ''; // Limpiar el valor del filtro
    this.filteredReservas = [...this.reservas]; // Restaurar la lista completa
  }

  getMinDate(): string {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Formato "2025-06-09T19:26" (24h)
  }

  updateEmpleadosByServicio(servicio: string): void {
    if (this.authService.isGerenteGeneral()) {
      if (!servicio || servicio === '') {
        this.toastr.success('Se cargó exitosamente la lista de servicios.', 'Éxito');
        this.empleados = [];
      } else {
        this.empleadoService.getEmpleadosForServicio(servicio).subscribe({
          next: (empleados) => {
            this.empleados = empleados;
            if (this.empleados.length > 0) {
              this.toastr.success('Lista de empleados cargada correctamente.', 'Éxito');
            } else {
              this.toastr.info('No hay especialistas disponibles para este servicio.', 'Información');
            }
          },
          error: (error) => {
            console.error('Error al cargar los empleados para el servicio:', error);
            this.toastr.error('Error al cargar los empleados para el servicio seleccionado.', 'Error');
            this.empleados = [];
          }
        });
      }
    }
  }
}