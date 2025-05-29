import { Component } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isLoggedIn$: Observable<boolean>;
  loginData = { email: '', password: '' };
  registerData = { dni: '', nombre: '', apellido: '', email: '', password: '', telefono: '' };

  // Lista de servicios
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

  constructor(public authService: AuthService, private router: Router) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onLogin() {
    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        const modalElement = document.getElementById('loginModal') as HTMLElement;
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modalInstance.hide();
        }
        this.loginData = { email: '', password: '' };
        // Redirigir según el rol del usuario
        if (this.authService.isGerenteGeneral()) {
          this.router.navigate(['/dashboard/admin']);
        } else if (this.authService.isRecepcionista()) {
          this.router.navigate(['/dashboard/recepcionista']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Error en el login:', error);
        alert(error.error.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.');
      }
    });
  }

  onRegister() {
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('Respuesta del backend:', response);
        alert(response.message || '¡Registro exitoso! Ahora puedes iniciar sesión.');
        const modalElement = document.getElementById('registerModal') as HTMLElement;
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modalInstance.hide();
        }
        this.registerData = { dni: '', nombre: '', apellido: '', email: '', password: '', telefono: '' };
      },
      error: (error) => {
        console.error('Error en el registro:', error);
        let errorMessage = 'Error al registrarse. Por favor, verifica los datos e intenta de nuevo.';
        if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo.';
        } else if (error.status === 400) {
          errorMessage = error.error.message || 'Datos inválidos. Por favor, verifica los campos.';
        } else if (error.status === 500) {
          errorMessage = error.error.message || 'Error interno del servidor. Por favor, intenta de nuevo más tarde.';
        }
        alert(errorMessage);
      }
    });
  }

  reservar(servicioEnum: string) {
    if (this.authService.getToken()) {
      this.router.navigate(['/reserva'], { queryParams: { servicio: servicioEnum } });
      // Cerrar el modal de servicios después de reservar
      const modalElement = document.getElementById('serviciosModal') as HTMLElement;
      if (modalElement) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modalInstance.hide();
      }
    } else {
      alert('Debes iniciar sesión para hacer una reserva.');
      const modalElement = document.getElementById('loginModal') as HTMLElement;
      if (modalElement) {
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
      }
      // Cerrar el modal de servicios si el usuario no está logueado
      const serviciosModal = document.getElementById('serviciosModal') as HTMLElement;
      if (serviciosModal) {
        const serviciosModalInstance = bootstrap.Modal.getInstance(serviciosModal) || new bootstrap.Modal(serviciosModal);
        serviciosModalInstance.hide();
      }
    }
  }
}