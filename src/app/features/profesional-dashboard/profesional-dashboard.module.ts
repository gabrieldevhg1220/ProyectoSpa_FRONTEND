import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfesionalDashboardRoutingModule } from './profesional-dashboard-routing.module';
import { ProfesionalDashboardComponent } from './profesional-dashboard.component';


@NgModule({
  declarations: [
    ProfesionalDashboardComponent
  ],
  imports: [
    CommonModule,
    ProfesionalDashboardRoutingModule
  ]
})
export class ProfesionalDashboardModule { }
