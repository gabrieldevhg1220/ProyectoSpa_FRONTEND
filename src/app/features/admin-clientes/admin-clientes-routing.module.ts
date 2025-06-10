import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminClientesComponent } from './admin-clientes.component';

const routes: Routes = [
  { path: '', component: AdminClientesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminClientesRoutingModule { }