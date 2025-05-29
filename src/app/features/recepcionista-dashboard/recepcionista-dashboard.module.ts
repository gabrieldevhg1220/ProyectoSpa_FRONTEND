import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecepcionistaDashboardComponent } from './recepcionista-dashboard.component';

@NgModule({
  declarations: [
    RecepcionistaDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    RecepcionistaDashboardComponent
  ]
})
export class RecepcionistaDashboardModule { }