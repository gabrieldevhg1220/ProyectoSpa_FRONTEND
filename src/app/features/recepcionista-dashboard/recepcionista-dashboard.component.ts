import { Component, OnInit } from '@angular/core';
import { ReservaService } from '@core/services/reserva.service';
import { ClienteService } from '@core/services/cliente.service';
import { EmpleadoService } from '@core/services/empleado.service';
import { Reserva } from '@core/models/reserva';
import { Cliente } from '@core/models/cliente';
import { Empleado } from '@core/models/empleado';
import { Servicio } from '@core/models/servicio';
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
  filteredReservas: Reserva[] = []; // Lista filtrada de reservas
  clientes: Cliente[] = [];
  empleados: Empleado[] = [];
  newReserva: Reserva = {
    id: 0,
    cliente: { id: 0, nombre: '', apellido: '', email: '', dni: '', telefono: '', password: '' },
    empleado: { id: 0, nombre: '', apellido: '', email: '', dni: '', telefono: '', rol: '' },
    fechaReserva: '', // Valor inicial vacío
    servicio: '',
    status: 'PENDIENTE'
  };
  editingReserva: Reserva | null = null;
  reservaCreada: boolean = false;
  ultimaReserva: Reserva | null = null;
  clienteData: Cliente | null = null;
  serviciosList: Servicio[] = [];
  showNewReservationButton: boolean = false;
  showGenerateInvoiceButton: boolean = false;
  filterEspecialista: string = ''; // Nuevo filtro por nombre del especialista
  filterDni: string = ''; // Nuevo filtro por DNI del cliente

  // Mapeo estático para convertir enums a nombres y precios
  private servicioMap: { [key: string]: { nombre: string; precio: number } } = {
    ANTI_STRESS: { nombre: 'Anti-stress', precio: 5000 },
    DESCONTRACTURANTE: { nombre: 'Descontracturantes', precio: 5500 },
    PIEDRAS_CALIENTES: { nombre: 'Masajes con Piedras Calientes', precio: 6000 },
    CIRCULATORIO: { nombre: 'Circulatorios', precio: 5200 },
    LIFTING_PESTANAS: { nombre: 'Lifting de Pestañas', precio: 3500 },
    DEPILACION_FACIAL: { nombre: 'Depilación Facial', precio: 2000 },
    BELLEZA_MANOS_PIES: { nombre: 'Belleza de Manos y Pies', precio: 4000 },
    PUNTA_DIAMANTE: { nombre: 'Punta de Diamante', precio: 4500 },
    LIMPIEZA_PROFUNDA: { nombre: 'Limpieza Profunda + Hidratación', precio: 4800 },
    CRIO_FRECUENCIA_FACIAL: { nombre: 'Crio Frecuencia Facial', precio: 6000 },
    VELASLIM: { nombre: 'VelaSlim', precio: 7000 },
    DERMOHEALTH: { nombre: 'DermoHealth', precio: 6500 },
    CRIOFRECUENCIA: { nombre: 'Criofrecuencia', precio: 7500 },
    ULTRACAVITACION: { nombre: 'Ultracavitación', precio: 6800 },
    HIDROMASAJES: { nombre: 'Hidromasajes', precio: 3000 },
    YOGA: { nombre: 'Yoga', precio: 2500 }
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
    this.loadEmpleados();
    this.loadServicios();
    // Eliminado this.setDefaultDate()
  }

  loadServicios(): void {
    this.reservaService.getServicios().subscribe({
      next: (servicios) => {
        this.serviciosList = servicios.map(servicio => ({
          ...servicio,
          precio: this.servicioMap[servicio.enum]?.precio || 0
        }));
      },
      error: (error) => {
        this.toastr.error('Error al cargar los servicios. Usando lista predeterminada.', 'Error');
        console.error('Error al cargar servicios:', error);
        this.serviciosList = Object.entries(this.servicioMap).map(([enumValue, { nombre, precio }]) => ({
          enum: enumValue,
          nombre,
          precio
        }));
      }
    });
  }

  loadReservas(): void {
    this.reservaService.getReservasForRecepcionista().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.filteredReservas = reservas; // Inicialmente, la lista filtrada es igual a la original
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

  loadEmpleados(): void {
    this.empleadoService.getEmpleadosForReservas().subscribe({
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
      },
      error: (error) => {
        console.error('Error al cargar los empleados:', error);
        let errorMessage = 'Error al cargar los empleados.';
        if (error.status === 403) {
          errorMessage = 'No tienes permisos para ver los empleados.';
        } else if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          this.authService.logout();
        }
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  // Método para aplicar los filtros
  applyFilters(): void {
    this.filteredReservas = this.reservas.filter(reserva => {
      // Filtro por nombre del especialista
      const especialistaMatch = !this.filterEspecialista || 
        `${reserva.empleado.nombre} ${reserva.empleado.apellido}`
          .toLowerCase()
          .includes(this.filterEspecialista.toLowerCase());

      // Filtro por DNI del cliente
      const dniMatch = !this.filterDni || 
        reserva.cliente.dni.toLowerCase().includes(this.filterDni.toLowerCase());

      // Combinar ambos filtros
      return especialistaMatch && dniMatch;
    });
  }

  // Método para limpiar los filtros y recargar las reservas
  clearFilters(): void {
    this.filterEspecialista = '';
    this.filterDni = '';
    this.loadReservas(); // Recarga la lista de reservas
  }

  createReserva(): void {
    const reservaToCreate = {
      ...this.newReserva,
      cliente: { id: this.newReserva.cliente.id },
      empleado: { id: this.newReserva.empleado.id }
    };
    this.reservaService.createReserva(reservaToCreate).subscribe({
      next: (newReserva) => {
        this.reservas.push(newReserva);
        this.applyFilters(); // Actualizar la lista filtrada
        this.toastr.success('Reserva creada exitosamente.', 'Éxito');
        this.ultimaReserva = newReserva;
        this.reservaCreada = true;
        this.showGenerateInvoiceButton = true;
        this.showNewReservationButton = true;
      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
        let errorMessage = 'Error al crear la reserva. Por favor, intenta de nuevo.';
        if (error.status === 403) {
          errorMessage = 'No tienes permisos para crear reservas.';
        } else if (error.status === 400) {
          errorMessage = 'Datos inválidos. Verifica los campos e intenta de nuevo.';
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

        const servicioDetails = this.serviciosList.find(s => s.enum === this.ultimaReserva!.servicio) || 
          { nombre: 'Servicio Desconocido', enum: '', precio: 0 };

        this.facturaService.generateFactura(
          this.ultimaReserva,
          this.clienteData,
          servicioDetails.nombre,
          servicioDetails.precio
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
    this.editingReserva = { ...reserva };
  }

  updateReserva(): void {
    if (this.editingReserva) {
      const reservaToUpdate = {
        ...this.editingReserva,
        cliente: { id: this.editingReserva.cliente.id },
        empleado: { id: this.editingReserva.empleado.id }
      };
      this.reservaService.updateReserva(this.editingReserva.id, reservaToUpdate).subscribe({
        next: (updatedReserva) => {
          const index = this.reservas.findIndex(r => r.id === updatedReserva.id);
          if (index !== -1) {
            this.reservas[index] = updatedReserva;
          }
          this.applyFilters(); // Actualizar la lista filtrada
          this.editingReserva = null;
          this.toastr.success('Reserva actualizada exitosamente.', 'Éxito');
        },
        error: (error) => {
          console.error('Error al actualizar la reserva:', error);
          let errorMessage = 'Error al actualizar la reserva.';
          if (error.status === 403) {
            errorMessage = 'No tienes permisos para actualizar esta reserva.';
          } else if (error.status === 400) {
            errorMessage = 'Datos inválidos. Verifica los campos e intenta de nuevo.';
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
          this.applyFilters(); // Actualizar la lista filtrada
          this.toastr.success('Reserva eliminada exitosamente.', 'Éxito');
        },
        error: (error) => {
          console.error('Error al eliminar la reserva:', error);
          let errorMessage = 'Error al eliminar la reserva.';
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
      fechaReserva: '', // Valor inicial vacío
      servicio: '',
      status: 'PENDIENTE'
    };
    // Eliminado this.setDefaultDate()
  }

  getMinDate(): string {
    const now = new Date();
    const zonedDate = toZonedTime(now, 'America/Argentina/Buenos_Aires');
    return format(zonedDate, "yyyy-MM-dd'T'HH:mm"); // Formato "2025-06-09T21:48" (24h)
  }

  setDefaultDate(): void {
    const now = new Date();
    const zonedDate = toZonedTime(now, 'America/Argentina/Buenos_Aires');
    this.newReserva.fechaReserva = format(zonedDate, "yyyy-MM-dd'T'HH:mm"); // Formato "2025-06-09T21:48" (24h)
  }
}