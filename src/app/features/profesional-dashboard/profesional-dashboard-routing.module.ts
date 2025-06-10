import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfesionalDashboardComponent } from './profesional-dashboard.component';

const routes: Routes = [{ path: '', component: ProfesionalDashboardComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfesionalDashboardRoutingModule { }
