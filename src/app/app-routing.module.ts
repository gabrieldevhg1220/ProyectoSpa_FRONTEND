import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { RecepcionistaGuard } from './core/guards/recepcionista.guard';
import { ProfesionalGuard } from './core/guards/profesional.guard';
import { ReservaComponent } from './reserva/reserva.component';
import { GestionClientesComponent } from './gestion-clientes/gestion-clientes.component';

const routes: Routes = [
  { path: '', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },
  { path: 'login', loadChildren: () => import('./features/login/login.module').then(m => m.LoginModule) },
  { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
  { path: 'dashboard/admin', loadChildren: () => import('./features/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardModule), canActivate: [AuthGuard, AdminGuard] },
  { path: 'dashboard/recepcionista', loadChildren: () => import('./features/recepcionista-dashboard/recepcionista-dashboard.module').then(m => m.RecepcionistaDashboardModule), canActivate: [AuthGuard, RecepcionistaGuard] },
  { path: 'dashboard/profesional', loadChildren: () => import('./features/profesional-dashboard/profesional-dashboard.module').then(m => m.ProfesionalDashboardModule), canActivate: [AuthGuard, ProfesionalGuard] },
  { path: 'admin/clientes', loadChildren: () => import('./features/admin-clientes/admin-clientes.module').then(m => m.AdminClientesModule), canActivate: [AuthGuard, AdminGuard] },
  { path: 'admin/empleados', loadChildren: () => import('./features/admin-empleados/admin-empleados.module').then(m => m.AdminEmpleadosModule), canActivate: [AuthGuard, AdminGuard] },
  { path: 'admin/reservas', loadChildren: () => import('./features/admin-reservas/admin-reservas.module').then(m => m.AdminReservasModule), canActivate: [AuthGuard, AdminGuard] },
  { path: 'reserva', component: ReservaComponent },
  { path: 'nosotros', redirectTo: '/' },
  { path: 'contactos', redirectTo: '/' },
  { path: 'gestion-clientes', component: GestionClientesComponent, canActivate: [AuthGuard, RecepcionistaGuard] },
  { path: 'profesional-dashboard', loadChildren: () => import('./features/profesional-dashboard/profesional-dashboard.module').then(m => m.ProfesionalDashboardModule) }, // Mover esta ruta antes del comodín
  { path: '**', redirectTo: '' }, // Comodín siempre al final
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }