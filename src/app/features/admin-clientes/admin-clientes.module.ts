import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminClientesRoutingModule } from './admin-clientes-routing.module';
import { AdminClientesComponent } from './admin-clientes.component';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [AdminClientesComponent],
  imports: [
    CommonModule,
    FormsModule,
    AdminClientesRoutingModule,
    ToastrModule.forRoot()
  ]
})
export class AdminClientesModule { }