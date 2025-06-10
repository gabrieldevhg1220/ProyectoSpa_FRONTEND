import { Component, OnInit } from '@angular/core';
import { ClienteService } from '@core/services/cliente.service';
import { Cliente } from '@core/models/cliente';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-gestion-clientes',
  standalone: false,
  templateUrl: './gestion-clientes.component.html',
  styleUrls: ['./gestion-clientes.component.scss']
})
export class GestionClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  newCliente: Cliente = {
    id: 0,
    nombre: '',
    apellido: '',
    email: '',
    dni: '',
    telefono: '',
    password: ''
  };
  editingCliente: Cliente | null = null;

  constructor(
    private clienteService: ClienteService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadClientes();
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

  createCliente(): void {
    this.clienteService.createCliente(this.newCliente).subscribe({
      next: (newCliente) => {
        this.clientes.push(newCliente);
        this.resetNewCliente();
        this.toastr.success('Cliente creado exitosamente.', 'Éxito');
        const modal = document.getElementById('addClienteModal');
        if (modal) {
          modal.classList.remove('show');
          modal.style.display = 'none';
          document.body.classList.remove('modal-open');
          const modalBackdrop = document.querySelector('.modal-backdrop');
          if (modalBackdrop) {
            modalBackdrop.remove();
          }
        }
      },
      error: (error) => {
        console.error('Error al crear el cliente:', error);
        let errorMessage = 'Error al crear el cliente. Por favor, intenta de nuevo.';
        if (error.status === 400) {
          errorMessage = 'Datos inválidos. Verifica los campos e intenta de nuevo.';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para crear clientes.';
        } else if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          this.authService.logout();
        }
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  editCliente(cliente: Cliente): void {
    this.editingCliente = { ...cliente };
  }

  updateCliente(): void {
    if (this.editingCliente) {
      this.clienteService.updateCliente(this.editingCliente.id, this.editingCliente).subscribe({
        next: (updatedCliente) => {
          const index = this.clientes.findIndex(c => c.id === updatedCliente.id);
          if (index !== -1) {
            this.clientes[index] = updatedCliente;
          }
          this.editingCliente = null;
          this.toastr.success('Cliente actualizado exitosamente.', 'Éxito');
          const modal = document.getElementById('editClienteModal');
          if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
            const modalBackdrop = document.querySelector('.modal-backdrop');
            if (modalBackdrop) {
              modalBackdrop.remove();
            }
          }
        },
        error: (error) => {
          console.error('Error al actualizar el cliente:', error);
          let errorMessage = 'Error al actualizar el cliente.';
          if (error.status === 403) {
            errorMessage = 'No tienes permisos para actualizar este cliente.';
          } else if (error.status === 400) {
            errorMessage = 'Datos inválidos. Verifica los campos e intenta de nuevo.';
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
  }

  deleteCliente(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.clienteService.deleteCliente(id).subscribe({
        next: () => {
          this.clientes = this.clientes.filter(c => c.id !== id);
          this.toastr.success('Cliente eliminado exitosamente.', 'Éxito');
        },
        error: (error) => {
          console.error('Error al eliminar el cliente:', error);
          let errorMessage = 'Error al eliminar el cliente.';
          if (error.status === 403) {
            errorMessage = 'No tienes permisos para eliminar este cliente.';
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
  }

  resetNewCliente(): void {
    this.newCliente = {
      id: 0,
      nombre: '',
      apellido: '',
      email: '',
      dni: '',
      telefono: '',
      password: ''
    };
  }
}