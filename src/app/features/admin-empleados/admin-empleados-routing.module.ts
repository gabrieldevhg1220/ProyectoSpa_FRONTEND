import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminEmpleadosComponent } from './admin-empleados.component';

const routes: Routes = [
  { path: '', component: AdminEmpleadosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEmpleadosRoutingModule { }