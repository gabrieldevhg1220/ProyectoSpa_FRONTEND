import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-chatbot',
  standalone: false,
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent implements OnInit, AfterViewInit {
  messages: { text: string, sender: 'bot' | 'user' }[] = [];
  userInput: string = '';
  isOpen: boolean = false;

  ngOnInit(): void {
    this.addBotMessage('¡Hola! Soy el asistente virtual de Sentirse Bien Spa. ¿En qué puedo ayudarte hoy? (Escribe "ayuda" para opciones)');
  }

  ngAfterViewInit(): void {
    console.log('Chatbot component initialized, isOpen:', this.isOpen);
    const toggleButton = document.getElementById('chatbot-toggle');
    if (toggleButton) {
      console.log('Toggle button found in DOM');
    } else {
      console.log('Toggle button NOT found in DOM');
    }
  }

  toggleChat(): void {
    console.log('Toggle chat clicked, isOpen:', !this.isOpen); // Depuración
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    if (this.userInput.trim()) {
      this.addUserMessage(this.userInput);
      this.processInput(this.userInput);
      this.userInput = '';
    }
  }

  addUserMessage(text: string): void {
    this.messages.push({ text, sender: 'user' });
  }

  addBotMessage(text: string): void {
    this.messages.push({ text, sender: 'bot' });
  }

  processInput(input: string): void {
    const lowerInput = input.toLowerCase().trim();
    switch (lowerInput) {
      case 'ayuda':
        this.addBotMessage('Puedo ayudarte con: \n- "servicios": Ver nuestros servicios \n- "horarios": Información general de horarios \n- "contacto": Datos de contacto');
        break;
      case 'servicios':
        this.addBotMessage('Ofrecemos masajes relajantes, tratamientos faciales y servicios grupales como yoga. ¡Reserva ahora en el botón de la página!');
        break;
      case 'horarios':
        this.addBotMessage('Estamos abiertos de lunes a sábado de 9:00 a 20:00. Consulta disponibilidad en la sección de reservas.');
        break;
      case 'contacto':
        this.addBotMessage('Puedes contactarnos en French 414, Resistencia, Chaco, Argentina | Teléfono: (362) 456-7890');
        break;
      default:
        this.addBotMessage('Lo siento, no entiendo. Escribe "ayuda" para ver las opciones.');
    }
  }
}