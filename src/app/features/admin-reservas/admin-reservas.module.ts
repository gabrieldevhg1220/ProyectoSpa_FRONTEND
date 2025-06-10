import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminReservasRoutingModule } from './admin-reservas-routing.module';
import { AdminReservasComponent } from './admin-reservas.component';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [AdminReservasComponent],
  imports: [
    CommonModule,
    FormsModule,
    AdminReservasRoutingModule,
    ToastrModule.forRoot()
  ]
})
export class AdminReservasModule { }