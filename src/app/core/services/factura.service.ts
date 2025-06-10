import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

// Función para cargar y registrar fuentes
const loadFont = async (doc: jsPDF, fontName: string, fontPath: string) => {
  const response = await fetch(fontPath);
  const arrayBuffer = await response.arrayBuffer();
  const fontData = new Uint8Array(arrayBuffer);
  // Convertir Uint8Array a base64
  let binary = '';
  const bytes = new Uint8Array(fontData);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64String = btoa(binary);
  doc.addFileToVFS(fontName, base64String);
  doc.addFont(fontName, 'Roboto', 'normal');
  return fontName;
};

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  constructor() {}

  async generateFactura(reserva: any, cliente: any, servicioNombre: string, precio: number) {
    const doc = new jsPDF();

    // Cargar las fuentes Roboto
    const fontRegular = await loadFont(doc, 'Roboto-Regular.ttf', 'assets/fonts/Roboto-Regular.ttf');
    const fontBold = await loadFont(doc, 'Roboto-Medium.ttf', 'assets/fonts/Roboto-Medium.ttf');
    const fontItalic = await loadFont(doc, 'Roboto-Italic.ttf', 'assets/fonts/Roboto-Italic.ttf');
    const fontBoldItalic = await loadFont(doc, 'Roboto-MediumItalic.ttf', 'assets/fonts/Roboto-MediumItalic.ttf');

    // Establecer la fuente predeterminada
    doc.setFont(fontRegular);

    const invoiceNumber = `INV-${Date.now()}`;
    const currentDate = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const fechaReserva = new Date(reserva.fechaReserva).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Configurar el contenido del PDF
    doc.setFontSize(22);
    doc.text('Factura - Sentirse Bien', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.text(`Número de Factura: ${invoiceNumber}`, 150, 30, { align: 'right' });
    doc.text(`Fecha de Emisión: ${currentDate}`, 150, 35, { align: 'right' });

    doc.setFont('Roboto-Medium.ttf'); // Usar fuente bold
    doc.setFontSize(16);
    doc.text('Datos del Cliente', 20, 50);

    doc.setFont(fontRegular);
    doc.setFontSize(12);
    doc.text(`Nombre: ${cliente.nombre || 'N/A'} ${cliente.apellido || ''}`, 20, 60);
    doc.text(`DNI: ${cliente.dni || 'N/A'}`, 20, 65);
    doc.text(`Email: ${cliente.email || 'N/A'}`, 20, 70);

    doc.setFont('Roboto-Medium.ttf');
    doc.text('Detalles de la Reserva', 20, 90);

    doc.setFont(fontRegular);
    doc.text(`Servicio: ${servicioNombre || 'N/A'}`, 20, 100);
    doc.text(`Fecha y Hora de Reserva: ${fechaReserva}`, 20, 105);
    doc.text(`Precio: $${precio || 0}`, 20, 110);

    doc.setFontSize(12);
    doc.text('Gracias por elegir Sentirse Bien!', 105, 150, { align: 'center' });

    // Guardar y abrir el PDF
    try {
      //doc.save(`factura_${invoiceNumber}.pdf`);
      window.open(URL.createObjectURL(new Blob([doc.output('blob')])), '_blank');
      return Promise.resolve(invoiceNumber);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      return Promise.reject(new Error('No se pudo generar la factura. Verifica la consola para más detalles. Error: ' + (error as Error).message));
    }
  }
}