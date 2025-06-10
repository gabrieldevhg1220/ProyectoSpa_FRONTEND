import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { AdminEmpleadosComponent } from '../admin-empleados/admin-empleados.component';
import { AdminClientesComponent } from '../admin-clientes/admin-clientes.component';
import { AdminReservasComponent } from '../admin-reservas/admin-reservas.component';
import { RecepcionistaDashboardComponent } from '../recepcionista-dashboard/recepcionista-dashboard.component';
import { AuthGuard } from '@core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'empleados', pathMatch: 'full' },
      { path: 'empleados', component: AdminEmpleadosComponent },
      { path: 'clientes', component: AdminClientesComponent },
      { path: 'reservas', component: AdminReservasComponent }
    ]
  },
  {
    path: 'recepcionista',
    component: RecepcionistaDashboardComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }