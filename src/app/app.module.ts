import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { AuthInterceptor } from '@core/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReservaComponent } from './reserva/reserva.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Necesario para ngx-toastr
import { ToastrModule } from 'ngx-toastr'; // Importar ToastrModule
// Componentes
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { RecepcionistaDashboardModule } from './features/recepcionista-dashboard/recepcionista-dashboard.module';


@NgModule({
  declarations: [
    AppComponent,
    ReservaComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    DashboardModule,
    RecepcionistaDashboardModule,
    BrowserAnimationsModule, // Añadir BrowserAnimationsModule
    ToastrModule.forRoot({   // Configurar ToastrModule globalmente
      timeOut: 3000,         // Duración del toast (3 segundos)
      positionClass: 'toast-top-right', // Posición del toast
      preventDuplicates: true, // Evitar mensajes duplicados
      closeButton: true,      // Mostrar botón de cerrar
      progressBar: true       // Mostrar barra de progreso
    }),
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // Confirma que esté registrado.
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
