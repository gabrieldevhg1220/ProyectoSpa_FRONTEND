import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminReservasComponent } from './admin-reservas.component';

const routes: Routes = [
  { path: '', component: AdminReservasComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminReservasRoutingModule { }