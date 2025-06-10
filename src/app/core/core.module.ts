import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ClienteService } from './services/cliente.service';
import { EmpleadoService } from './services/empleado.service';
import { ReservaService } from './services/reserva.service';
import { AuthGuard } from './guards/auth.guard';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    AuthService,
    ClienteService,
    EmpleadoService,
    ReservaService,
    AuthGuard
  ]
})
export class CoreModule { }
