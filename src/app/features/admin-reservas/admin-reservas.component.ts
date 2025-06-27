import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ReservaService } from '@core/services/reserva.service';
import { ClienteService } from '@core/services/cliente.service';
import { EmpleadoService } from '@core/services/empleado.service';
import { AuthService } from '@core/services/auth.service';
import { Reserva, ReservaServicio, Servicio, Cliente, Empleado } from '@core/models/reserva';

@Component({
  selector: 'app-admin-reservas',
  standalone: false,
  templateUrl: './admin-reservas.component.html',
  styleUrls: ['./admin-reservas.component.scss']
})
export class AdminReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  filteredReservas: Reserva[] = [];
  clientes: Cliente[] = [];
  empleados: Empleado[] = [];
  servicios: Servicio[] = [];
  newReserva: Reserva = {
    id: 0,
    cliente: { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' },
    empleado: { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' },
    fechaReserva: '',
    status: 'PENDIENTE',
    medioPago: 'EFECTIVO',
    servicios: [{ id: 0, fechaServicio: '', servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' } }],
    pagos: []
  };
  editingReserva: Reserva | null = null;
  selectedClienteId: number | null = null;
  selectedEmpleadoId: number | null = null;
  filterDni: string = '';
  newServicios: { servicio: Servicio; fechaServicio: string }[] = [{ servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' }, fechaServicio: '' }];

  constructor(
    private reservaService: ReservaService,
    private clienteService: ClienteService,
    private empleadoService: EmpleadoService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.isGerenteGeneral) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadReservas();
    this.loadClientes();
    this.loadEmpleados();
    this.loadServicios();
  }

  loadReservas(): void {
    this.reservaService.getAllReservas().subscribe({
      next: (data) => {
        this.reservas = data.map(r => ({
          ...r,
          cliente: r.cliente || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' },
          empleado: r.empleado || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' },
          servicios: r.servicios || [{ id: 0, fechaServicio: '', servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' } }],
          pagos: r.pagos || []
        }));
        this.filteredReservas = [...this.reservas];
        if (data.length === 0) {
          this.toastr.info('No hay reservas registradas.', 'Información');
        }
        this.applyFilters();
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
        this.clientes = clientes.map(c => ({
          id: c.id || 0,
          dni: c.dni || '',
          nombre: c.nombre || '',
          apellido: c.apellido || '',
          email: c.email || '',
          telefono: c.telefono || '',
          password: c.password || ''
        }));
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
        this.empleados = empleados.map(e => ({
          id: e.id || 0,
          dni: e.dni || '',
          nombre: e.nombre || '',
          apellido: e.apellido || '',
          email: e.email || '',
          telefono: e.telefono || '',
          rol: e.rol || ''
        }));
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
        this.servicios = servicios.map(s => ({
          id: s.id || 0,
          nombre: s.nombre || '',
          descripcion: s.descripcion || '',
          precio: s.precio || 0,
          enum: s.enum || ''
        }));
        if (this.servicios.length === 0) {
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
    if (!this.selectedClienteId || !this.selectedEmpleadoId || this.newServicios.some(s => !s.servicio.id || !s.fechaServicio)) {
      this.toastr.error('Por favor, selecciona un cliente, un empleado y completa los servicios con fechas.', 'Error');
      return;
    }

    const cliente = this.clientes.find(c => c.id === this.selectedClienteId) || { id: this.selectedClienteId, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' };
    const empleado = this.empleados.find(e => e.id === this.selectedEmpleadoId) || { id: this.selectedEmpleadoId, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' };

    const reservaData: Reserva = {
      id: 0,
      cliente: cliente,
      empleado: empleado,
      fechaReserva: this.newServicios[0].fechaServicio,
      status: this.newReserva.status,
      medioPago: this.newReserva.medioPago,
      servicios: this.newServicios.map(s => ({
        id: 0,
        fechaServicio: s.fechaServicio,
        servicio: this.servicios.find(serv => serv.id === s.servicio.id) || { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' }
      })),
      pagos: []
    };

    this.reservaService.createReserva(reservaData).subscribe({
      next: (newReserva) => {
        this.reservas.push(newReserva);
        this.filteredReservas = [...this.reservas];
        this.applyFilters();
        this.toastr.success('Reserva creada exitosamente.', 'Éxito');
        this.loadReservas(); // Recargar reservas automáticamente
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
    this.newServicios = reserva.servicios.map(s => ({ servicio: s.servicio, fechaServicio: s.fechaServicio }));
    const modalElement = document.getElementById('editReservaModal') as HTMLElement;
    if (modalElement) {
      const modalInstance = new (window as any).bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  updateReserva(): void {
    if (this.editingReserva) {
      const updatedReserva: Reserva = {
        ...this.editingReserva,
        cliente: this.clientes.find(c => c.id === this.editingReserva!.cliente.id) || { id: this.editingReserva!.cliente.id, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' },
        empleado: this.empleados.find(e => e.id === this.editingReserva!.empleado.id) || { id: this.editingReserva!.empleado.id, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' },
        fechaReserva: this.newServicios[0].fechaServicio,
        servicios: this.newServicios.map(s => ({
          id: 0,
          fechaServicio: s.fechaServicio,
          servicio: this.servicios.find(serv => serv.id === s.servicio.id) || { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' }
        })),
        pagos: this.editingReserva.pagos || []
      };

      this.reservaService.updateReserva(this.editingReserva.id, updatedReserva).subscribe({
        next: (reserva) => {
          const index = this.reservas.findIndex(r => r.id === reserva.id);
          if (index !== -1) {
            this.reservas[index] = reserva;
            this.filteredReservas = [...this.reservas];
            this.applyFilters();
          }
          this.toastr.success('Reserva actualizada exitosamente.', 'Éxito');
          this.editingReserva = null;
          this.loadReservas(); // Recargar reservas automáticamente
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
          this.filteredReservas = [...this.reservas];
          this.applyFilters();
          this.toastr.success('Reserva eliminada exitosamente.', 'Éxito');
          this.loadReservas(); // Recargar reservas automáticamente
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
      cliente: { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' },
      empleado: { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' },
      fechaReserva: '',
      status: 'PENDIENTE',
      medioPago: 'EFECTIVO',
      servicios: [{ id: 0, fechaServicio: '', servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' } }],
      pagos: []
    };
    this.selectedClienteId = null;
    this.selectedEmpleadoId = null;
    this.newServicios = [{ servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' }, fechaServicio: '' }];
  }

  applyFilters(): void {
    this.filteredReservas = this.reservas.filter(reserva => {
      const clienteDni = reserva.cliente.dni || '';
      const matchesDni = this.filterDni ? clienteDni.toLowerCase().includes(this.filterDni.toLowerCase()) : true;
      return matchesDni;
    });
  }

  clearFilter(): void {
    this.filterDni = '';
    this.filteredReservas = [...this.reservas];
  }

  getMinDate(): string {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  }

  addServicio(): void {
    this.newServicios.push({ servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' }, fechaServicio: '' });
  }

  removeServicio(index: number): void {
    if (this.newServicios.length > 1) {
      this.newServicios.splice(index, 1);
    }
  }

  updateEmpleadosByServicio(servicioId: number): void {
    const servicio = this.servicios.find(s => s.id === servicioId);
    if (this.isGerenteGeneral) {
      if (!servicioId || !servicio) {
        this.toastr.success('Se cargó exitosamente la lista de servicios.', 'Éxito');
        this.empleados = [];
      } else {
        this.empleadoService.getEmpleadosForServicio(servicio.enum).subscribe({
          next: (empleados) => {
            this.empleados = empleados.map(e => ({
              id: e.id || 0,
              dni: e.dni || '',
              nombre: e.nombre || '',
              apellido: e.apellido || '',
              email: e.email || '',
              telefono: e.telefono || '',
              rol: e.rol || ''
            }));
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

  get isGerenteGeneral(): boolean {
    return this.authService.isGerenteGeneral();
  }
}