import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminEmpleadosRoutingModule } from './admin-empleados-routing.module';
import { AdminEmpleadosComponent } from './admin-empleados.component';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [AdminEmpleadosComponent],
  imports: [
    CommonModule,
    FormsModule,
    AdminEmpleadosRoutingModule,
    ToastrModule.forRoot()
  ]
})
export class AdminEmpleadosModule { }