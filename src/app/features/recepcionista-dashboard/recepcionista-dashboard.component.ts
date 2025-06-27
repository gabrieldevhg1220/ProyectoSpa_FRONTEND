import { Component, OnInit } from '@angular/core';
import { ReservaService } from '@core/services/reserva.service';
import { ClienteService } from '@core/services/cliente.service';
import { EmpleadoService } from '@core/services/empleado.service';
import { Reserva, ReservaServicio, Servicio, Cliente, Empleado } from '@core/models/reserva';
import { ToastrService } from 'ngx-toastr';
import { FacturaService } from '@core/services/factura.service';
import { AuthService } from '@core/services/auth.service';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

@Component({
  selector: 'app-recepcionista-dashboard',
  standalone: false,
  templateUrl: './recepcionista-dashboard.component.html',
  styleUrls: ['./recepcionista-dashboard.component.scss']
})
export class RecepcionistaDashboardComponent implements OnInit {
  reservas: Reserva[] = [];
  filteredReservas: Reserva[] = [];
  clientes: Cliente[] = [];
  empleados: Empleado[] = [];
  newReserva: Reserva = {
    id: 0,
    cliente: { id: 0, nombre: '', apellido: '', email: '', dni: '', telefono: '', password: '' },
    empleado: { id: 0, nombre: '', apellido: '', email: '', dni: '', telefono: '', rol: '' },
    fechaReserva: '',
    status: 'PENDIENTE',
    medioPago: 'EFECTIVO',
    descuentoAplicado: undefined,
    historial: undefined,
    servicios: [{ id: 0, fechaServicio: '', servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' } }],
    pagos: []
  };
  editingReserva: Reserva | null = null;
  reservaCreada: boolean = false;
  ultimaReserva: Reserva | null = null;
  clienteData: Cliente | null = null;
  serviciosList: Servicio[] = [];
  showNewReservationButton: boolean = false;
  showGenerateInvoiceButton: boolean = false;
  filterEspecialista: string = '';
  filterDni: string = '';

  private servicioMap: { [key: string]: { nombre: string; precio: number; descripcion?: string } } = {
    ANTI_STRESS: { nombre: 'Anti-stress', precio: 5000, descripcion: 'Masaje relajante para reducir el estrés' },
    DESCONTRACTURANTE: { nombre: 'Descontracturantes', precio: 5500, descripcion: 'Masaje para aliviar contracturas musculares' },
    PIEDRAS_CALIENTES: { nombre: 'Masajes con Piedras Calientes', precio: 6000, descripcion: 'Masaje terapéutico con piedras calientes' },
    CIRCULATORIO: { nombre: 'Circulatorios', precio: 5000, descripcion: 'Masaje para mejorar la circulación' },
    LIFTING_PESTANAS: { nombre: 'Lifting de Pestañas', precio: 3500, descripcion: 'Tratamiento para alargar y curvar pestañas' },
    DEPILACION_FACIAL: { nombre: 'Depilación Facial', precio: 2000, descripcion: 'Depilación facial con cera o hilo' },
    BELLEZA_MANOS_PIES: { nombre: 'Belleza de Manos y Pies', precio: 3000, descripcion: 'Manicura y pedicura completa' },
    PUNTA_DIAMANTE: { nombre: 'Punta de Diamante', precio: 3500, descripcion: 'Exfoliación facial con punta de diamante' },
    LIMPIEZA_PROFUNDA: { nombre: 'Limpieza Profunda + Hidratación', precio: 4800, descripcion: 'Limpieza facial profunda con hidratación' },
    CRIO_FRECUENCIA_FACIAL: { nombre: 'Crio Frecuencia Facial', precio: 4800, descripcion: 'Tratamiento facial con crioterapia' },
    VELASLIM: { nombre: 'VelaSlim', precio: 5500, descripcion: 'Tratamiento reductor con tecnología VelaSlim' },
    DERMOHEALTH: { nombre: 'DermoHealth', precio: 5500, descripcion: 'Tratamiento dermatológico avanzado' },
    CRIOFRECUENCIA: { nombre: 'Criofrecuencia', precio: 6000, descripcion: 'Tratamiento de criofrecuencia corporal' },
    ULTRACAVITACION: { nombre: 'Ultracavitación', precio: 6800, descripcion: 'Tratamiento de reducción de grasa con ultrasonido' },
    HIDROMASAJES: { nombre: 'Hidromasajes', precio: 3000, descripcion: 'Sesión de hidromasaje relajante' },
    YOGA: { nombre: 'Yoga', precio: 2500, descripcion: 'Clase de yoga para relajación y flexibilidad' }
  };

  constructor(
    private reservaService: ReservaService,
    private clienteService: ClienteService,
    private empleadoService: EmpleadoService,
    private facturaService: FacturaService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadReservas();
    this.loadClientes();
    this.loadServicios();
    this.updateEmpleadosByServicio('');
  }

  loadServicios(): void {
    this.reservaService.getServicios().subscribe({
      next: (servicios) => {
        this.serviciosList = servicios.map(servicio => ({
          ...servicio,
          precio: this.servicioMap[servicio.enum]?.precio || servicio.precio || 0
        }));
      },
      error: (error) => {
        this.toastr.error('Error al cargar los servicios. Usando lista predeterminada.', 'Error');
        console.error('Error al cargar servicios:', error);
        this.serviciosList = Object.entries(this.servicioMap).map(([enumValue, { nombre, precio, descripcion }], index) => ({
          id: index + 1, // Asignar un ID único temporal
          nombre,
          descripcion: descripcion || 'Descripción no disponible',
          precio,
          enum: enumValue
        }));
      }
    });
  }

  loadReservas(): void {
    this.reservaService.getReservasForRecepcionista().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.filteredReservas = reservas;
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

  loadClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (error) => {
        console.error('Error al cargar los clientes:', error);
        let errorMessage = 'Error al cargar los clientes.';
        if (error.status === 403) {
          errorMessage = 'No tienes permisos para ver los clientes.';
        } else if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          this.authService.logout();
        }
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  updateEmpleadosByServicio(servicioEnum: string): void {
    const safeServicio = servicioEnum || '';
    this.empleadoService.getEmpleadosForServicio(safeServicio).subscribe({
      next: (empleados) => {
        const isGerenteGeneral = this.authService.isGerenteGeneral();
        const isRecepcionista = this.authService.isRecepcionista();
        if (isGerenteGeneral || isRecepcionista) {
          this.empleados = empleados.filter(empleado =>
            empleado.rol !== 'GERENTE_GENERAL' && empleado.rol !== 'RECEPCIONISTA'
          );
        } else {
          this.empleados = empleados;
        }
        if (safeServicio) {
          this.toastr.success('Lista de empleados cargada correctamente.', 'Éxito');
        }
      },
      error: (error) => {
        console.error('Error al cargar los empleados para el servicio:', error);
        if (!safeServicio) {
          this.toastr.success('Se cargó exitosamente la lista de servicios.', 'Éxito');
        } else {
          this.toastr.error('Error al cargar los empleados para el servicio seleccionado.', 'Error');
        }
        this.empleados = [];
      }
    });
  }

  applyFilters(): void {
    this.filteredReservas = this.reservas.filter(reserva => {
      const especialistaMatch = !this.filterEspecialista || 
        `${reserva.empleado.nombre} ${reserva.empleado.apellido}`
          .toLowerCase()
          .includes(this.filterEspecialista.toLowerCase());
      const dniMatch = !this.filterDni || 
        reserva.cliente.dni.toLowerCase().includes(this.filterDni.toLowerCase());
      return especialistaMatch && dniMatch;
    });
  }

  clearFilters(): void {
    this.filterEspecialista = '';
    this.filterDni = '';
    this.loadReservas();
  }

  createReserva(): void {
    if (!this.newReserva.cliente.id || !this.newReserva.empleado.id || !this.newReserva.fechaReserva || this.newReserva.servicios.some(s => !s.servicio.enum || !s.fechaServicio) || !this.newReserva.medioPago) {
      this.toastr.error('Por favor, completa todos los campos requeridos.', 'Error');
      return;
    }

    const cliente = this.clientes.find(c => c.id === this.newReserva.cliente.id) || { id: this.newReserva.cliente.id, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' };
    const empleado = this.empleados.find(e => e.id === this.newReserva.empleado.id) || { id: this.newReserva.empleado.id, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' };

    const reservaToCreate: Reserva = {
      id: 0,
      cliente: cliente,
      empleado: empleado,
      fechaReserva: this.newReserva.fechaReserva,
      status: this.newReserva.status,
      medioPago: this.newReserva.medioPago,
      descuentoAplicado: this.newReserva.descuentoAplicado,
      historial: this.newReserva.historial,
      servicios: this.newReserva.servicios.map(s => ({
        id: 0,
        fechaServicio: s.fechaServicio,
        servicio: this.serviciosList.find(serv => serv.enum === s.servicio.enum) || { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' }
      })),
      pagos: []
    };

    this.reservaService.createReserva(reservaToCreate).subscribe({
      next: (newReserva) => {
        this.reservas.push(newReserva);
        this.applyFilters();
        this.toastr.success('Reserva creada exitosamente.', 'Éxito');
        this.ultimaReserva = newReserva;
        this.reservaCreada = true;
        this.showGenerateInvoiceButton = true;
        this.showNewReservationButton = true;
      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
        let errorMessage = error.error?.message || 'Error al crear la reserva. Por favor, intenta de nuevo.';
        if (error.status === 403) {
          errorMessage = 'No tienes permisos para crear reservas. Verifica tu rol o sesión.';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Datos inválidos. Verifica los campos e intenta de nuevo.';
        } else if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          this.authService.logout();
        }
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  generarFactura(): void {
    if (!this.ultimaReserva || !this.ultimaReserva.cliente.id) {
      this.toastr.error('No hay datos suficientes para generar la factura.', 'Error');
      return;
    }
    this.clienteService.getCliente(this.ultimaReserva.cliente.id).subscribe({
      next: (cliente) => {
        this.clienteData = cliente;
        const servicios = this.ultimaReserva.servicios.map(s => ({
          nombre: s.servicio.nombre,
          precio: s.servicio.precio,
          fecha: s.fechaServicio
        }));
        const valorOriginal = this.ultimaReserva.servicios.reduce((sum, s) => sum + s.servicio.precio, 0);
        const descuento = this.ultimaReserva.medioPago === 'TARJETA_DEBITO' && this.ultimaReserva.descuentoAplicado ? this.ultimaReserva.descuentoAplicado : 0;
        const valorConDescuento = this.ultimaReserva.pagos.length > 0 ? this.ultimaReserva.pagos[0].montoTotal : valorOriginal * (1 - (descuento / 100));
        this.facturaService.generateFactura(
          this.ultimaReserva,
          this.clienteData,
          servicios,
          this.ultimaReserva.medioPago,
          valorOriginal,
          descuento,
          valorConDescuento
        ).then((invoiceNumber) => {
          this.toastr.success(`Factura ${invoiceNumber} generada y abierta.`, 'Éxito');
        }).catch((error) => {
          this.toastr.error(error.message || 'Error al generar la factura. Por favor, intenta de nuevo.', 'Error');
        });
      },
      error: (error) => {
        console.error('Error al obtener el cliente:', error);
        let errorMessage = 'Error al obtener los datos del cliente para la factura.';
        if (error.status === 403) {
          errorMessage = 'No tienes permisos para acceder a los datos del cliente.';
        } else if (error.status === 404) {
          errorMessage = 'Cliente no encontrado.';
        } else if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          this.authService.logout();
        }
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  editReserva(reserva: Reserva): void {
    this.editingReserva = { ...reserva, medioPago: reserva.medioPago || 'EFECTIVO' };
    const modalElement = document.getElementById('editReservaModal') as HTMLElement;
    if (modalElement) {
      const modalInstance = new (window as any).bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  updateReserva(): void {
    if (this.editingReserva) {
      if (!this.editingReserva.cliente.id || !this.editingReserva.empleado.id || !this.editingReserva.fechaReserva || this.editingReserva.servicios.some(s => !s.servicio.enum || !s.fechaServicio) || !this.editingReserva.medioPago) {
        this.toastr.error('Por favor, completa todos los campos requeridos.', 'Error');
        return;
      }
      const cliente = this.clientes.find(c => c.id === this.editingReserva!.cliente.id) || { id: this.editingReserva!.cliente.id, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' };
      const empleado = this.empleados.find(e => e.id === this.editingReserva!.empleado.id) || { id: this.editingReserva!.empleado.id, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' };

      const reservaToUpdate: Reserva = {
        ...this.editingReserva,
        cliente: cliente,
        empleado: empleado,
        servicios: this.editingReserva.servicios.map(s => ({
          id: 0,
          fechaServicio: s.fechaServicio,
          servicio: this.serviciosList.find(serv => serv.enum === s.servicio.enum) || { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' }
        })),
        pagos: this.editingReserva.pagos || []
      };

      this.reservaService.updateReserva(this.editingReserva.id, reservaToUpdate).subscribe({
        next: (updatedReserva) => {
          const index = this.reservas.findIndex(r => r.id === updatedReserva.id);
          if (index !== -1) {
            this.reservas[index] = updatedReserva;
          }
          this.applyFilters();
          this.toastr.success('Reserva actualizada exitosamente.', 'Éxito');
          this.editingReserva = null;
          const modalElement = document.getElementById('editReservaModal') as HTMLElement;
          if (modalElement) {
            const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
          }
        },
        error: (error) => {
          console.error('Error al actualizar la reserva:', error);
          let errorMessage = error.error?.message || 'Error al actualizar la reserva.';
          if (error.status === 403) {
            errorMessage = 'No tienes permisos para actualizar esta reserva.';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Datos inválidos. Verifica los campos e intenta de nuevo.';
          } else if (error.status === 404) {
            errorMessage = 'La reserva no se encontró.';
          } else if (error.status === 401) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
            this.authService.logout();
          }
          this.toastr.error(errorMessage, 'Error');
        }
      });
    }
  }

  deleteReserva(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      this.reservaService.deleteReserva(id).subscribe({
        next: () => {
          this.reservas = this.reservas.filter(r => r.id !== id);
          this.applyFilters();
          this.toastr.success('Reserva eliminada exitosamente.', 'Éxito');
        },
        error: (error) => {
          console.error('Error al eliminar la reserva:', error);
          let errorMessage = error.error?.message || 'Error al eliminar la reserva.';
          if (error.status === 403) {
            errorMessage = 'No tienes permisos para eliminar esta reserva.';
          } else if (error.status === 404) {
            errorMessage = 'La reserva no se encontró.';
          } else if (error.status === 401) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
            this.authService.logout();
          }
          this.toastr.error(errorMessage, 'Error');
        }
      });
    }
  }

  newReservation(): void {
    this.resetNewReserva();
    this.showNewReservationButton = false;
    this.showGenerateInvoiceButton = false;
    this.ultimaReserva = null;
  }

  resetNewReserva(): void {
    this.newReserva = {
      id: 0,
      cliente: { id: 0, nombre: '', apellido: '', email: '', dni: '', telefono: '', password: '' },
      empleado: { id: 0, nombre: '', apellido: '', email: '', dni: '', telefono: '', rol: '' },
      fechaReserva: '',
      status: 'PENDIENTE',
      medioPago: 'EFECTIVO',
      descuentoAplicado: undefined,
      historial: undefined,
      servicios: [{ id: 0, fechaServicio: '', servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' } }],
      pagos: []
    };
    this.updateEmpleadosByServicio('');
  }

  getMinDate(): string {
    const now = new Date();
    const zonedDate = toZonedTime(now, 'America/Argentina/Buenos_Aires');
    return format(zonedDate, "yyyy-MM-dd'T'HH:mm");
  }

  setDefaultDate(): void {
    const now = new Date();
    const zonedDate = toZonedTime(now, 'America/Argentina/Buenos_Aires');
    this.newReserva.fechaReserva = format(zonedDate, "yyyy-MM-dd'T'HH:mm");
  }

  addServicio(): void {
    this.newReserva.servicios.push({ id: 0, fechaServicio: '', servicio: { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' } });
  }

  removeServicio(index: number): void {
    if (this.newReserva.servicios.length > 1) {
      this.newReserva.servicios.splice(index, 1);
    }
  }
}