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

  serviciosIndividuales = [
    {
      categoria: 'Masajes',
      items: [
        { nombre: 'Anti-stress', descripcion: 'Un masaje relajante para aliviar el estrés.', precio: 5000, imagen: 'assets/images/anti-stress.jpg', enum: 'ANTI_STRESS' },
        { nombre: 'Descontracturantes', descripcion: 'Ideal para aliviar tensiones musculares.', precio: 5500, imagen: 'assets/images/descontracturante.jpg', enum: 'DESCONTRACTURANTE' },
        { nombre: 'Masajes con piedras calientes', descripcion: 'Relajación profunda con piedras calientes.', precio: 6000, imagen: 'assets/images/piedras-calientes.jpg', enum: 'PIEDRAS_CALIENTES' },
        { nombre: 'Circulatorios', descripcion: 'Mejora la circulación y reduce la retención de líquidos.', precio: 5200, imagen: 'assets/images/circulatorio.jpg', enum: 'CIRCULATORIO' }
      ]
    },
    {
      categoria: 'Belleza',
      items: [
        { nombre: 'Lifting de pestañas', descripcion: 'Realza tus pestañas con un efecto natural.', precio: 3500, imagen: 'assets/images/lifting-pestanas.jpg', enum: 'LIFTING_PESTANAS' },
        { nombre: 'Depilación facial', descripcion: 'Elimina el vello facial con técnicas suaves.', precio: 2000, imagen: 'assets/images/depilacionfacial.jpg', enum: 'DEPILACION_FACIAL' },
        { nombre: 'Belleza de manos y pies', descripcion: 'Manicura y pedicura para un cuidado completo.', precio: 4000, imagen: 'assets/images/belleza-manos-pies.jpg', enum: 'BELLEZA_MANOS_PIES' }
      ]
    },
    {
      categoria: 'Tratamientos Faciales',
      items: [
        { nombre: 'Punta de Diamante', descripcion: 'Microexfoliación para una piel renovada.', precio: 4500, imagen: 'assets/images/punta-diamante.jpg', enum: 'PUNTA_DIAMANTE' },
        { nombre: 'Limpieza profunda + Hidratación', descripcion: 'Limpieza e hidratación para un rostro radiante.', precio: 4800, imagen: 'assets/images/limpieza-profunda.jpg', enum: 'LIMPIEZA_PROFUNDA' },
        { nombre: 'Crio frecuencia facial', descripcion: 'Efecto lifting instantáneo con shock térmico.', precio: 6000, imagen: 'assets/images/crio-frecuencia-facial.jpg', enum: 'CRIO_FRECUENCIA_FACIAL' }
      ]
    },
    {
      categoria: 'Tratamientos Corporales',
      items: [
        { nombre: 'VelaSlim', descripcion: 'Reducción de circunferencia corporal y celulitis.', precio: 7000, imagen: 'assets/images/velaslim.jpg', enum: 'VELASLIM' },
        { nombre: 'DermoHealth', descripcion: 'Drenaje linfático y estimulación de microcirculación.', precio: 6500, imagen: 'assets/images/dermohealth.jpg', enum: 'DERMOHEALTH' },
        { nombre: 'Criofrecuencia', descripcion: 'Efecto lifting instantáneo para el cuerpo.', precio: 7500, imagen: 'assets/images/criofrecuencia.jpg', enum: 'CRIOFRECUENCIA' },
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

    this.empleadoService.getEmpleadosForReservas().subscribe({
      next: (empleados) => {
        const rolesExcluidos = ['GERENTE_GENERAL', 'RECEPCIONISTA', 'COORDINADOR_AREA'];
        this.empleadosDisponibles = empleados.filter(empleado => !rolesExcluidos.includes(empleado.rol));
        console.log('Empleados disponibles filtrados:', this.empleadosDisponibles);
        if (this.empleadosDisponibles.length > 0) {
          this.toastr.success('Lista de empleados cargada correctamente.', 'Éxito');
        } else {
          this.toastr.info('No hay especialistas disponibles en este momento.', 'Información');
        }
      },
      error: (error) => {
        console.error('Error al obtener empleados:', error);
        this.toastr.error(error.message || 'Error al cargar la lista de empleados. Por favor, intenta de nuevo.', 'Error');
      }
    });
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
        return 'Masjista Terapeutico';
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

  private getServicioDetails(servicioEnum: string): { nombre: string, precio: number } | null {
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
  }

  onEmpleadoChange(newValue: number | null) {
    this.empleadoId = newValue;
    console.log('Empleado seleccionado:', this.empleadoId);
  }

  isFormValid(): boolean {
    console.log('Validando formulario - fechaReserva:', this.fechaReserva, 'empleadoId:', this.empleadoId, 'servicio:', this.servicio, 'empleadosDisponibles.length:', this.empleadosDisponibles.length);
    const isFechaReservaValid = this.fechaReserva.trim().length > 0;
    const isEmpleadoIdValid = this.empleadoId !== null && this.empleadoId > 0;
    const isServicioValid = this.servicio !== null && this.servicio.trim().length > 0;
    const isEmpleadosAvailable = this.empleadosDisponibles.length > 0;
    const isValid = isFechaReservaValid && isEmpleadoIdValid && isServicioValid && isEmpleadosAvailable;
    console.log('Validación resultado:', isValid);
    return isValid;
  }

  getMinDate(): string {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Formato "2025-06-09T19:26" (24h)
  }

  hacerReserva() {
    console.log('Ejecutando hacerReserva()');
    if (!this.isFormValid()) {
      this.toastr.warning('Por favor, completa todos los campos requeridos.', 'Advertencia');
      return;
    }

    if (this.formularioDeshabilitado) {
      console.log('Formulario deshabilitado, no se creará otra reserva');
      return;
    }

    // Usar el valor directo de fechaReserva en formato ISO 24h
    const fechaFormateada = this.fechaReserva; // Ya está en formato "2025-06-09T19:26"

    console.log('Fecha enviada al backend:', fechaFormateada);

    const reserva = {
      cliente: { id: this.clienteId },
      empleado: { id: this.empleadoId },
      fechaReserva: fechaFormateada,
      servicio: this.servicio,
      status: 'CONFIRMADA'
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
      this.servicioDetails.precio
    ).then((invoiceNumber) => {
      this.toastr.success(`Factura ${invoiceNumber} generada y abierta.`, 'Éxito');
    }).catch((error) => {
      this.toastr.error(error.message || 'Error al generar la factura. Por favor, intenta de nuevo.', 'Error');
    });
  }
}