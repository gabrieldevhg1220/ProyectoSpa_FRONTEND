import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '@core/services/cliente.service';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cliente } from '@core/models/cliente';

@Component({
  selector: 'app-admin-clientes',
  standalone: false,
  templateUrl: './admin-clientes.component.html',
  styleUrls: ['./admin-clientes.component.scss']
})
export class AdminClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];
  selectedCliente: Cliente = { dni: '', nombre: '', apellido: '', email: '', telefono: '' };
  isEditing = false;
  filterDni: string = '';

  constructor(
    private clienteService: ClienteService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isGerenteGeneral()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadClientes();
  }

  loadClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.filteredClientes = [...this.clientes]; // Inicialmente, la lista filtrada es igual a la original
        if (data.length === 0) {
          this.toastr.info('No hay clientes registrados.', 'Información');
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

  applyFilters(): void {
    this.filteredClientes = this.clientes.filter(cliente => {
      const matchesDni = this.filterDni ? cliente.dni.toLowerCase().includes(this.filterDni.toLowerCase()) : true;
      return matchesDni;
    });
  }

  clearFilter(): void {
    this.filterDni = ''; // Limpiar el valor del filtro
    this.filteredClientes = [...this.clientes]; // Restaurar la lista completa
  }

  onSubmit(): void {
    if (this.isEditing) {
      this.updateCliente();
    } else {
      this.createCliente();
    }
  }

  createCliente(): void {
    this.clienteService.createCliente(this.selectedCliente).subscribe({
      next: () => {
        this.toastr.success('Cliente creado exitosamente.', 'Éxito');
        this.loadClientes();
        this.resetForm();
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error al crear el cliente.', 'Error');
        console.error('Error al crear cliente:', error);
        if (error.message.includes('No estás autenticado')) {
          this.authService.logout();
        }
      }
    });
  }

  editCliente(cliente: Cliente): void {
    this.selectedCliente = { ...cliente };
    this.isEditing = true;
  }

  updateCliente(): void {
    this.clienteService.updateCliente(this.selectedCliente.id!, this.selectedCliente).subscribe({
      next: () => {
        this.toastr.success('Cliente actualizado exitosamente.', 'Éxito');
        this.loadClientes();
        this.resetForm();
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error al actualizar el cliente.', 'Error');
        console.error('Error al actualizar cliente:', error);
        if (error.message.includes('No estás autenticado')) {
          this.authService.logout();
        }
      }
    });
  }

  deleteCliente(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.clienteService.deleteCliente(id).subscribe({
        next: () => {
          this.toastr.success('Cliente eliminado exitosamente.', 'Éxito');
          this.loadClientes();
        },
        error: (error) => {
          this.toastr.error(error.message || 'Error al eliminar el cliente.', 'Error');
          console.error('Error al eliminar cliente:', error);
          if (error.message.includes('No estás autenticado')) {
            this.authService.logout();
          }
        }
      });
    }
  }

  resetForm(): void {
    this.selectedCliente = { dni: '', nombre: '', apellido: '', email: '', telefono: '' };
    this.isEditing = false;
  }
}