import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [HomeComponent, ChatbotComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: HomeComponent }])
  ]
})
export class HomeModule { }
