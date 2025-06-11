import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfesionalDashboardRoutingModule } from './profesional-dashboard-routing.module';
import { ProfesionalDashboardComponent } from './profesional-dashboard.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ProfesionalDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ProfesionalDashboardRoutingModule
  ]
})
export class ProfesionalDashboardModule { }
