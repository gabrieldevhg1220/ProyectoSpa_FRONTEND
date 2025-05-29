import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { RouterModule } from '@angular/router';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { AdminEmpleadosComponent } from '../admin-empleados/admin-empleados.component';
import { AdminClientesComponent } from '../admin-clientes/admin-clientes.component';
import { AdminReservasComponent } from '../admin-reservas/admin-reservas.component';
import { RecepcionistaDashboardComponent } from '../recepcionista-dashboard/recepcionista-dashboard.component';


@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule,
    RouterModule.forChild([{ path: '', component: DashboardComponent }])
  ]
})
export class DashboardModule { }
