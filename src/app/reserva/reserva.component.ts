import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ReservaService } from '@core/services/reserva.service';
import { EmpleadoService } from '@core/services/empleado.service';
import { FacturaService } from '@core/services/factura.service';
import { ClienteService } from '@core/services/cliente.service';
import { ToastrService } from 'ngx-toastr';
import { Reserva, Cliente, Empleado, ReservaServicio, Servicio } from '@core/models/reserva';

@Component({
  selector: 'app-reserva',
  standalone: false,
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.scss']
})
export class ReservaComponent implements OnInit {
  serviciosSeleccionados: { servicio: string | null, fechaServicio: string, empleadoId: number | null }[] = [{ servicio: null, fechaServicio: '', empleadoId: null }];
  clienteId: number | null = null;
  empleadosDisponibles: Map<string, Empleado[]> = new Map();
  reservaCreada: boolean = false;
  ultimaReserva: Reserva | null = null;
  serviciosDetails: Map<string, { nombre: string, precio: number }> = new Map();
  clienteData: Cliente | null = null;
  formularioDeshabilitado: boolean = false;
  show48HoursWarning: boolean[] = [];
  medioPago: string = '';
  preciosFinales: Map<string, number> = new Map();
  showDiscountMessage: boolean[] = [];
  descuentosAplicados: Map<string, number> = new Map();

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

    this.serviciosSeleccionados.forEach((_, index) => this.updateEmpleadosByServicio(null, index));
    this.show48HoursWarning = this.serviciosSeleccionados.map(() => false);
    this.showDiscountMessage = this.serviciosSeleccionados.map(() => false);
  }

  simplificarRol(rol: string): string {
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

  onServicioChange(servicio: string | null, index: number) {
    this.serviciosSeleccionados[index].servicio = servicio;
    console.log(`Servicio seleccionado en índice ${index}:`, servicio);
    this.updateEmpleadosByServicio(servicio, index);
    this.check48Hours(index);
    this.updatePrecio(index);
  }

  onEmpleadoChange(empleadoId: number | null, index: number) {
    this.serviciosSeleccionados[index].empleadoId = empleadoId;
    console.log(`Empleado seleccionado en índice ${index}:`, empleadoId);
    this.check48Hours(index);
  }

  onMedioPagoChange(newValue: string) {
    this.medioPago = newValue;
    console.log('Medio de pago seleccionado:', this.medioPago);
    this.serviciosSeleccionados.forEach((_, index) => this.updatePrecio(index));
  }

  onFechaServicioChange(fecha: string, index: number) {
    this.serviciosSeleccionados[index].fechaServicio = fecha;
    console.log(`Fecha de servicio seleccionada en índice ${index}:`, fecha);
    this.check48Hours(index);
    this.updatePrecio(index);
  }

  private updatePrecio(index: number): void {
    const servicio = this.serviciosSeleccionados[index].servicio;
    this.preciosFinales.delete(index.toString());
    this.showDiscountMessage[index] = false;
    this.descuentosAplicados.delete(index.toString());

    if (!servicio) return;

    const servicioDetails = this.getServicioDetails(servicio);
    if (!servicioDetails) return;

    let precioBase = servicioDetails.precio;
    let precioFinal = precioBase;
    let descuentoAplicado = 0;

    if (this.medioPago === 'TARJETA_DEBITO' && this.serviciosSeleccionados[index].fechaServicio && this.isDateWithin48Hours(this.serviciosSeleccionados[index].fechaServicio)) {
      descuentoAplicado = 15;
      precioFinal = precioBase * 0.85;
      this.showDiscountMessage[index] = true;
    }

    this.preciosFinales.set(index.toString(), precioFinal);
    this.serviciosDetails.set(index.toString(), servicioDetails);
    this.descuentosAplicados.set(index.toString(), descuentoAplicado);
  }

  isFormValid(): boolean {
    return this.serviciosSeleccionados.every((s, index) => {
      const isFechaValid = s.fechaServicio.trim().length > 0;
      const isEmpleadoValid = s.empleadoId !== null && s.empleadoId > 0;
      const isServicioValid = s.servicio !== null && s.servicio.trim().length > 0;
      const isEmpleadosAvailable = (this.empleadosDisponibles.get(index.toString()) || []).length > 0;
      const isDateWithin48Hours = this.isDateWithin48Hours(s.fechaServicio);
      const isMedioPagoValid = this.medioPago.trim().length > 0;
      return isFechaValid && isEmpleadoValid && isServicioValid && isEmpleadosAvailable && isDateWithin48Hours && isMedioPagoValid;
    });
  }

  private isDateWithin48Hours(fechaServicio: string): boolean {
    if (!fechaServicio) return false;
    const now = new Date();
    const selectedDate = new Date(fechaServicio);
    const diffMs = selectedDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 48;
  }

  private check48Hours(index: number): void {
    this.show48HoursWarning[index] = this.serviciosSeleccionados[index].fechaServicio.trim().length > 0 && !this.isDateWithin48Hours(this.serviciosSeleccionados[index].fechaServicio);
  }

  getMinDate(): string {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  }

  agregarServicio() {
    this.serviciosSeleccionados.push({ servicio: null, fechaServicio: '', empleadoId: null });
    this.show48HoursWarning.push(false);
    this.showDiscountMessage.push(false);
    this.updateEmpleadosByServicio(null, this.serviciosSeleccionados.length - 1);
  }

  eliminarServicio(index: number) {
    this.serviciosSeleccionados.splice(index, 1);
    this.show48HoursWarning.splice(index, 1);
    this.showDiscountMessage.splice(index, 1);
    this.empleadosDisponibles.delete(index.toString());
    this.preciosFinales.delete(index.toString());
    this.serviciosDetails.delete(index.toString());
    this.descuentosAplicados.delete(index.toString());
  }

  hacerReserva() {
    if (!this.isFormValid()) {
      this.toastr.warning('Por favor, completa todos los campos requeridos o selecciona fechas al menos 48 horas antes.', 'Advertencia');
      return;
    }

    if (this.formularioDeshabilitado) {
      console.log('Formulario deshabilitado, no se creará otra reserva');
      return;
    }

    const cliente = this.clienteId ? { id: this.clienteId, dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' } : null;
    if (!cliente) {
      this.toastr.error('No se pudo identificar el cliente.', 'Error');
      return;
    }

    const empleadoIds = this.serviciosSeleccionados.map(s => s.empleadoId);
    const empleado = this.empleadosDisponibles.get('0')?.find(e => e.id === empleadoIds[0]) || { id: 0, dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' };

    // Calcular el descuento total basado en descuentosAplicados
    const totalDiscount = Array.from(this.descuentosAplicados.values()).reduce((sum, discount) => sum + discount, 0) / this.serviciosSeleccionados.length || 0;

    const reserva: Reserva = {
      id: 0,
      cliente: cliente,
      empleado: empleado,
      fechaReserva: this.serviciosSeleccionados[0].fechaServicio,
      status: 'PENDIENTE',
      medioPago: this.medioPago,
      descuentoAplicado: totalDiscount > 0 ? totalDiscount : undefined, // Asignar descuento solo si aplica
      servicios: this.serviciosSeleccionados.map(s => ({
        id: 0,
        fechaServicio: s.fechaServicio,
        servicio: this.getServicioDetails(s.servicio || '') ? {
          id: 0,
          nombre: this.getServicioDetails(s.servicio || '')!.nombre,
          descripcion: '',
          precio: this.getServicioDetails(s.servicio || '')!.precio,
          enum: s.servicio || ''
        } : { id: 0, nombre: '', descripcion: '', precio: 0, enum: '' }
      })),
      pagos: []
    };

    this.reservaService.createReserva(reserva).subscribe({
      next: (response) => {
        this.toastr.success('Reserva creada exitosamente.', 'Éxito');
        // Asegurar que servicios y descuentoAplicado se inicialicen con los datos enviados o recibidos
        this.ultimaReserva = { ...response, servicios: response.servicios || reserva.servicios, descuentoAplicado: response.descuentoAplicado || reserva.descuentoAplicado };
        this.formularioDeshabilitado = true;
        this.reservaCreada = true;

        this.clienteService.getClienteByToken().subscribe({
          next: (clienteData) => {
            this.clienteData = {
              id: clienteData.id || 0,
              nombre: clienteData.nombre || 'N/A',
              apellido: clienteData.apellido || '',
              dni: clienteData.dni || 'N/A',
              email: clienteData.email || 'N/A',
              telefono: clienteData.telefono || '',
              password: ''
            };
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
    if (!this.ultimaReserva || !this.clienteData) {
      this.toastr.error('No hay datos suficientes para generar la factura.', 'Error');
      return;
    }

    // Verificar si servicios está definido antes de mapear
    const servicios = this.ultimaReserva.servicios ? this.ultimaReserva.servicios.map(s => ({
      nombre: s.servicio.nombre,
      precio: s.servicio.precio,
      fecha: s.fechaServicio
    })) : [];
    const valorOriginal = this.ultimaReserva.servicios ? this.ultimaReserva.servicios.reduce((sum, s) => sum + s.servicio.precio, 0) : 0;
    const descuento = this.ultimaReserva.medioPago === 'TARJETA_DEBITO' && this.ultimaReserva.descuentoAplicado !== undefined && this.ultimaReserva.descuentoAplicado !== null ? this.ultimaReserva.descuentoAplicado : 0;
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
      console.error('Error al generar la factura:', error);
      this.toastr.error(error.message || 'Error al generar la factura. Revisa la consola para más detalles.', 'Error');
    });
  }

  updateEmpleadosByServicio(servicio: string | null, index: number): void {
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
            this.empleadosDisponibles.set(index.toString(), filteredEmpleados);
            console.log(`Empleados disponibles actualizados para índice ${index}:`, filteredEmpleados);
            if (filteredEmpleados.length > 0) {
              this.toastr.success('Lista de empleados cargada correctamente.', 'Éxito');
            } else {
              this.toastr.info('No hay especialistas disponibles para este servicio.', 'Información');
            }
            this.check48Hours(index);
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
        this.empleadosDisponibles.set(index.toString(), []);
      }
    });
  }
}