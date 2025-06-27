import { Component, OnInit } from '@angular/core';
import { ReservaService } from '@core/services/reserva.service';
import { Reserva, ReservaServicio, Servicio, Cliente, Empleado } from '@core/models/reserva';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  reservas: Reserva[] = [];
  servicios: Servicio[] = [];
  filteredReservas: Reserva[] = [];
  filterText: string = '';
  nuevaReserva: Reserva = {
    id: 0,
    cliente: { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' },
    empleado: { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' },
    fechaReserva: '',
    status: 'PENDIENTE',
    medioPago: 'EFECTIVO',
    servicios: [{ id: 0, fechaServicio: '', servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' } }],
    pagos: []
  };
  selectedEmpleadoId: number | null = null;
  empleados: Empleado[] = [];

  constructor(private reservaService: ReservaService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadReservas();
    this.loadServicios();
    this.loadEmpleados();
  }

  loadReservas(): void {
    this.reservaService.getReservas().subscribe({
      next: (data) => {
        this.reservas = data.map(r => ({
          ...r,
          cliente: r.cliente || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' },
          empleado: r.empleado || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' },
          servicios: r.servicios || [{ id: 0, fechaServicio: '', servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' } }],
          pagos: r.pagos || []
        }));
        this.filteredReservas = [...this.reservas];
        this.applyFilter();
      },
      error: (error) => {
        this.toastr.error('Error al cargar las reservas.', 'Error');
        console.error('Error al cargar reservas:', error);
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
          enum: s.enum || '' // Asegurar que enum siempre esté presente
        }));
      },
      error: (error) => {
        this.toastr.error('Error al cargar los servicios.', 'Error');
        console.error('Error al cargar servicios:', error);
      }
    });
  }

  loadEmpleados(): void {
    // Simulación de carga de empleados (ajusta según tu servicio real)
    // Aquí deberías integrar con EmpleadoService si existe
    this.empleados = [
      { id: 1, dni: '12345678', nombre: 'Juan', apellido: 'Pérez', email: 'juan@example.com', telefono: '123456789', rol: 'MASAJISTA_TERAPEUTICO' },
      { id: 2, dni: '87654321', nombre: 'María', apellido: 'Gómez', email: 'maria@example.com', telefono: '987654321', rol: 'ESTETICISTA' }
    ];
  }

  applyFilter(): void {
    this.filteredReservas = this.reservas.filter(reserva =>
      `${reserva.cliente.nombre} ${reserva.cliente.apellido} ${reserva.empleado.nombre} ${reserva.empleado.apellido}`
        .toLowerCase()
        .includes(this.filterText.toLowerCase())
    );
  }

  clearFilter(): void {
    this.filterText = '';
    this.applyFilter();
  }

  createReserva(): void {
    if (!this.nuevaReserva.servicios[0].servicio.id || !this.nuevaReserva.servicios[0].fechaServicio || !this.selectedEmpleadoId || !this.nuevaReserva.medioPago) {
      this.toastr.error('Por favor, completa todos los campos requeridos.', 'Error');
      return;
    }

    const empleado = this.empleados.find(e => e.id === this.selectedEmpleadoId) || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' };
    const reserva: Reserva = {
      ...this.nuevaReserva,
      empleado: empleado,
      fechaReserva: this.nuevaReserva.servicios[0].fechaServicio
    };

    this.reservaService.createReserva(reserva).subscribe({
      next: (newReserva) => {
        this.reservas.push(newReserva);
        this.filteredReservas = [...this.reservas];
        this.toastr.success('Reserva creada exitosamente.', 'Éxito');
        this.resetForm();
      },
      error: (error) => {
        this.toastr.error('Error al crear la reserva.', 'Error');
        console.error('Error al crear reserva:', error);
      }
    });
  }

  resetForm(): void {
    this.nuevaReserva = {
      id: 0,
      cliente: { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' },
      empleado: { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' },
      fechaReserva: '',
      status: 'PENDIENTE',
      medioPago: 'EFECTIVO',
      servicios: [{ id: 0, fechaServicio: '', servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' } }],
      pagos: []
    };
    this.selectedEmpleadoId = null;
  }

  getReadableRole(rol: string): string {
    switch (rol) {
      case 'ESTETICISTA': return 'Esteticista';
      case 'TECNICO_ESTETICA_AVANZADA': return 'Estética Avanzada';
      case 'ESPECIALISTA_CUIDADO_UNAS': return 'Cuidado de Uñas';
      case 'MASAJISTA_TERAPEUTICO': return 'Masajista Terapéutico';
      case 'TERAPEUTA_SPA': return 'Terapeuta en Spa';
      case 'INSTRUCTOR_YOGA': return 'Instructor/a de Yoga';
      case 'NUTRICIONISTA': return 'Nutricionista';
      default: return rol;
    }
  }
}