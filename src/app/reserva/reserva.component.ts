import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ReservaService } from '@core/services/reserva.service';
import { EmpleadoService } from '@core/services/empleado.service';
import { FacturaService } from '@core/services/factura.service';
import { ClienteService } from '@core/services/cliente.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reserva',
  standalone: false,
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.scss']
})
export class ReservaComponent implements OnInit {
  servicio: string | null = null;
  fechaReserva: string = '';
  empleadoId: number | null = null;
  clienteId: number | null = null;
  empleadosDisponibles: any[] = [];
  reservaCreada: boolean = false;
  ultimaReserva: any = null;
  servicioDetails: { nombre: string, precio: number } | null = null;
  clienteData: any = null;
  formularioDeshabilitado: boolean = false;
  show48HoursWarning: boolean = false;
  medioPago: string = '';
  precioFinal: number | null = null;
  showDiscountMessage: boolean = false;
  descuentoAplicado: number = 0;

  serviciosIndividuales = [
    {
      categoria: 'Masajes',
      items: [
        { nombre: 'Anti-stress', descripcion: 'Un masaje relajante para aliviar el estrés.', precio: 5000, imagen: 'assets/images/anti-stress.jpg', enum: 'ANTI_STRESS' },
        { nombre: 'Descontracturante', descripcion: 'Ideal para aliviar tensiones musculares.', precio: 5500, imagen: 'assets/images/descontracturante.jpg', enum: 'DESCONTRACTURANTE' },
        { nombre: 'Masajes con piedras calientes', descripcion: 'Relajación profunda con piedras calientes.', precio: 6000, imagen: 'assets/images/piedras-calientes.jpg', enum: 'PIEDRAS_CALIENTES' },
        { nombre: 'Circulatorio', descripcion: 'Mejora la circulación y reduce la retención de líquidos.', precio: 5000, imagen: 'assets/images/circulatorio.jpg', enum: 'CIRCULATORIO' }
      ]
    },
    {
      categoria: 'Belleza',
      items: [
        { nombre: 'Lifting de pestañas', descripcion: 'Realza tus pestañas con un efecto natural.', precio: 3500, imagen: 'assets/images/lifting-pestanas.jpg', enum: 'LIFTING_PESTANAS' },
        { nombre: 'Depilación facial', descripcion: 'Elimina el vello facial con técnicas suaves.', precio: 2000, imagen: 'assets/images/depilacionfacial.jpg', enum: 'DEPILACION_FACIAL' },
        { nombre: 'Belleza de manos y pies', descripcion: 'Manicura y pedicura para un cuidado completo.', precio: 3000, imagen: 'assets/images/belleza-manos-pies.jpg', enum: 'BELLEZA_MANOS_PIES' }
      ]
    },
    {
      categoria: 'Tratamientos Faciales',
      items: [
        { nombre: 'Punta de Diamante', descripcion: 'Microexfoliación para una piel renovada.', precio: 3500, imagen: 'assets/images/punta-diamante.jpg', enum: 'PUNTA_DIAMANTE' },
        { nombre: 'Limpieza profunda + Hidratación', descripcion: 'Limpieza e hidratación para un rostro radiante.', precio: 4800, imagen: 'assets/images/limpieza-profunda.jpg', enum: 'LIMPIEZA_PROFUNDA' },
        { nombre: 'Crio frecuencia facial', descripcion: 'Efecto lifting instantáneo con shock térmico.', precio: 4800, imagen: 'assets/images/crio-frecuencia-facial.jpg', enum: 'CRIO_FRECUENCIA_FACIAL' }
      ]
    },
    {
      categoria: 'Tratamientos Corporales',
      items: [
        { nombre: 'VelaSlim', descripcion: 'Reducción de circunferencia corporal y celulitis.', precio: 5500, imagen: 'assets/images/velaslim.jpg', enum: 'VELASLIM' },
        { nombre: 'DermoHealth', descripcion: 'Drenaje linfático y estimulación de microcirculación.', precio: 5500, imagen: 'assets/images/dermohealth.jpg', enum: 'DERMOHEALTH' },
        { nombre: 'Criofrecuencia', descripcion: 'Efecto lifting instantáneo para el cuerpo.', precio: 6000, imagen: 'assets/images/criofrecuencia.jpg', enum: 'CRIOFRECUENCIA' },
        { nombre: 'Ultracavitación', descripcion: 'Técnica reductora para moldear el cuerpo.', precio: 6800, imagen: 'assets/images/ultracavitacion.jpg', enum: 'ULTRACAVITACION' }
      ]
    }
  ];

  serviciosGrupales = [
    {
      categoria: 'Servicios Grupales',
      items: [
        { nombre: 'Hidromasajes', descripcion: 'Sesiones relajantes en hidromasaje.', precio: 3000, imagen: 'assets/images/hidromasajes.jpg', enum: 'HIDROMASAJES' },
        { nombre: 'Yoga', descripcion: 'Clases de yoga para grupos.', precio: 2500, imagen: 'assets/images/yoga1.jpg', enum: 'YOGA' }
      ]
    }
  ];

  serviciosList: { nombre: string, enum: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private reservaService: ReservaService,
    private empleadoService: EmpleadoService,
    private facturaService: FacturaService,
    private clienteService: ClienteService,
    private toastr: ToastrService
  ) {
    console.log('ReservaComponent inicializado');
  }

  ngOnInit() {
    console.log('ngOnInit ejecutado');

    this.serviciosList = [];
    this.serviciosIndividuales.forEach(categoria => {
      categoria.items.forEach(item => {
        this.serviciosList.push({ nombre: item.nombre, enum: item.enum });
      });
    });
    this.serviciosGrupales.forEach(categoria => {
      categoria.items.forEach(item => {
        this.serviciosList.push({ nombre: item.nombre, enum: item.enum });
      });
    });
    console.log('Servicios locales cargados:', this.serviciosList);

    this.route.queryParams.subscribe(params => {
      this.servicio = params['servicio'] || null;
      console.log('Servicio desde queryParams:', this.servicio);
      this.updatePrecio();
    });

    const clienteIdString = this.authService.getUserId();
    this.clienteId = clienteIdString ? parseInt(clienteIdString, 10) : null;
    if (!this.clienteId || !this.authService.isLoggedIn()) {
      this.toastr.warning('Debes iniciar sesión para hacer una reserva.', 'Advertencia');
      this.router.navigate(['/']);
      const modal = document.getElementById('loginModal') as HTMLElement;
      if (modal) {
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
      }
      return;
    }

    this.updateEmpleadosByServicio(this.servicio || '');
  }

  simplificarRol(rol: string): string {
    switch (rol) {
      case 'ESTETICISTA':
        return 'Esteticista';
      case 'TECNICO_ESTETICA_AVANZADA':
        return 'Estética Avanzada';
      case 'ESPECIALISTA_CUIDADO_UNAS':
        return 'Cuidado de Uñas';
      case 'MASAJISTA_TERAPEUTICO':
        return 'Masajista Terapéutico';
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

  public getServicioDetails(servicioEnum: string): { nombre: string, precio: number } | null {
    let servicioItem = null;
    for (const categoria of this.serviciosIndividuales) {
      servicioItem = categoria.items.find(item => item.enum === servicioEnum);
      if (servicioItem) break;
    }
    if (!servicioItem) {
      for (const categoria of this.serviciosGrupales) {
        servicioItem = categoria.items.find(item => item.enum === servicioEnum);
        if (servicioItem) break;
      }
    }
    return servicioItem ? { nombre: servicioItem.nombre, precio: servicioItem.precio } : null;
  }

  onServicioChange(newValue: string | null) {
    this.servicio = newValue;
    console.log('Servicio seleccionado:', this.servicio);
    this.updateEmpleadosByServicio(this.servicio || '');
    this.check48Hours();
    this.updatePrecio();
  }

  onEmpleadoChange(newValue: number | null) {
    this.empleadoId = newValue;
    console.log('Empleado seleccionado:', this.empleadoId);
    this.check48Hours();
  }

  onMedioPagoChange(newValue: string) {
    this.medioPago = newValue;
    console.log('Medio de pago seleccionado:', this.medioPago);
    this.updatePrecio();
  }

  onFechaReservaChange(newValue: string) {
    this.fechaReserva = newValue;
    console.log('Fecha de reserva seleccionada:', this.fechaReserva);
    this.check48Hours();
    this.updatePrecio();
  }

  private updatePrecio(): void {
    this.precioFinal = null;
    this.showDiscountMessage = false;
    this.descuentoAplicado = 0;

    if (!this.servicio) return;

    const servicioDetails = this.getServicioDetails(this.servicio);
    if (!servicioDetails) return;

    let precioBase = servicioDetails.precio;
    this.precioFinal = precioBase;

    if (this.medioPago === 'TARJETA_DEBITO' && this.fechaReserva && this.isDateWithin48Hours(this.fechaReserva)) {
      this.descuentoAplicado = 15; // 15% de descuento
      this.precioFinal = precioBase * 0.85; // 15% de descuento
      this.showDiscountMessage = true;
    }
  }

  isFormValid(): boolean {
    console.log('Validando formulario - fechaReserva:', this.fechaReserva, 'empleadoId:', this.empleadoId, 'servicio:', this.servicio, 'empleadosDisponibles.length:', this.empleadosDisponibles.length, 'medioPago:', this.medioPago);
    const isFechaReservaValid = this.fechaReserva.trim().length > 0;
    const isEmpleadoIdValid = this.empleadoId !== null && this.empleadoId > 0;
    const isServicioValid = this.servicio !== null && this.servicio.trim().length > 0;
    const isEmpleadosAvailable = this.empleadosDisponibles.length > 0;
    const isDateWithin48Hours = this.isDateWithin48Hours(this.fechaReserva);
    const isMedioPagoValid = this.medioPago.trim().length > 0;
    const isValid = isFechaReservaValid && isEmpleadoIdValid && isServicioValid && isEmpleadosAvailable && isDateWithin48Hours && isMedioPagoValid;
    this.check48Hours();
    console.log('Validación resultado:', isValid);
    return isValid;
  }

  private isDateWithin48Hours(fechaReserva: string): boolean {
    if (!fechaReserva) return false;
    const now = new Date();
    const selectedDate = new Date(fechaReserva);
    const diffMs = selectedDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    console.log('Diferencia en horas:', diffHours);
    return diffHours >= 48;
  }

  private check48Hours(): void {
    this.show48HoursWarning = this.fechaReserva.trim().length > 0 && !this.isDateWithin48Hours(this.fechaReserva);
  }

  getMinDate(): string {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  }

  hacerReserva() {
    console.log('Ejecutando hacerReserva()');
    if (!this.isFormValid()) {
      this.toastr.warning('Por favor, completa todos los campos requeridos o selecciona una fecha al menos 48 horas antes.', 'Advertencia');
      return;
    }

    if (this.formularioDeshabilitado) {
      console.log('Formulario deshabilitado, no se creará otra reserva');
      return;
    }

    const fechaFormateada = this.fechaReserva;

    console.log('Fecha enviada al backend:', fechaFormateada);

    const reserva = {
      cliente: { id: this.clienteId },
      empleado: { id: this.empleadoId },
      fechaReserva: fechaFormateada,
      servicio: this.servicio,
      status: 'CONFIRMADA',
      medioPago: this.medioPago,
      descuentoAplicado: this.descuentoAplicado // Enviar el descuento al backend
    };

    this.reservaService.createReserva(reserva).subscribe({
      next: (response) => {
        this.toastr.success('Reserva creada exitosamente.', 'Éxito');
        this.ultimaReserva = response;
        this.formularioDeshabilitado = true;

        this.servicioDetails = this.getServicioDetails(this.servicio!);
        if (!this.servicioDetails) {
          this.toastr.error('No se encontraron los detalles del servicio para generar la factura.', 'Error');
          this.router.navigate(['/']);
          return;
        }
        // Usar precioFinal en lugar de depender de response.precioFinal
        this.servicioDetails.precio = this.precioFinal || this.servicioDetails.precio;

        this.clienteService.getClienteByToken().subscribe({
          next: (clienteData) => {
            this.clienteData = {
              nombre: clienteData.nombre || 'N/A',
              apellido: clienteData.apellido || '',
              dni: clienteData.dni || 'N/A',
              email: clienteData.email || 'N/A'
            };
            this.reservaCreada = true;
          },
          error: (error) => {
            this.toastr.error('Error al obtener los datos del cliente para la factura.', 'Error');
            this.router.navigate(['/']);
          }
        });
      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
        this.toastr.error(error.error?.message || 'Error al crear la reserva. Por favor, intenta de nuevo.', 'Error');
      }
    });
  }

  generarFactura() {
    console.log('Ejecutando generarFactura()');
    if (!this.ultimaReserva || !this.servicioDetails || !this.clienteData) {
      this.toastr.error('No hay datos suficientes para generar la factura.', 'Error');
      return;
    }

    this.facturaService.generateFactura(
      this.ultimaReserva,
      this.clienteData,
      this.servicioDetails.nombre,
      this.servicioDetails.precio // Ya contiene el precio final
    ).then((invoiceNumber) => {
      this.toastr.success(`Factura ${invoiceNumber} generada y abierta.`, 'Éxito');
    }).catch((error) => {
      this.toastr.error(error.message || 'Error al generar la factura. Por favor, intenta de nuevo.', 'Error');
    });
  }

  updateEmpleadosByServicio(servicio: string): void {
    const safeServicio = servicio || '';
    this.empleadoService.getEmpleadosForServicio(safeServicio).subscribe({
      next: (empleados) => {
        this.empleadoService.getEmpleadosForReservas().subscribe({
          next: (allEmpleados) => {
            let filteredEmpleados = empleados;
            if (safeServicio) {
              filteredEmpleados = empleados.filter(empleado =>
                empleado.rol !== 'GERENTE_GENERAL' && empleado.rol !== 'RECEPCIONISTA' && empleado.rol !== 'COORDINADOR_AREA'
              );
            }
            this.empleadosDisponibles = filteredEmpleados.filter(empleado =>
              empleado.rol !== 'GERENTE_GENERAL' && empleado.rol !== 'RECEPCIONISTA' && empleado.rol !== 'COORDINADOR_AREA'
            );
            console.log('Empleados disponibles actualizados:', this.empleadosDisponibles);
            if (this.empleadosDisponibles.length > 0) {
              this.toastr.success('Lista de empleados cargada correctamente.', 'Éxito');
            } else {
              this.toastr.info('No hay especialistas disponibles para este servicio.', 'Información');
            }
            this.check48Hours();
          },
          error: (error) => {
            console.error('Error al obtener todos los empleados:', error);
            this.toastr.error('Error al cargar la lista de empleados. Por favor, intenta de nuevo.', 'Error');
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar los empleados para el servicio:', error);
        if (!safeServicio) {
          this.toastr.success('Se cargó exitosamente la lista de servicios.', 'Éxito');
        } else {
          this.toastr.error('Error al cargar los empleados para el servicio seleccionado.', 'Error');
        }
        this.empleadosDisponibles = [];
      }
    });
  }
}