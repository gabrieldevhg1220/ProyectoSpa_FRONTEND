import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://spabackend-wphn.onrender.com';

const loadFont = async (doc: jsPDF, fontName: string, fontPath: string) => {
  const response = await fetch(fontPath);
  const arrayBuffer = await response.arrayBuffer();
  const fontData = new Uint8Array(arrayBuffer);
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
  private apiUrl = `${API_BASE_URL}/api/factura/send-invoice`;

  constructor(private http: HttpClient) {}

  async generateFactura(reserva: any, cliente: any, servicios: any[], medioPago: string, valorOriginal: number, descuento: number | null, valorConDescuento: number) {
    const doc = new jsPDF();

    const fontRegular = await loadFont(doc, 'Roboto-Regular.ttf', 'assets/fonts/Roboto-Regular.ttf');
    const fontBold = await loadFont(doc, 'Roboto-Medium.ttf', 'assets/fonts/Roboto-Medium.ttf');
    const fontItalic = await loadFont(doc, 'Roboto-Italic.ttf', 'assets/fonts/Roboto-Italic.ttf');
    const fontBoldItalic = await loadFont(doc, 'Roboto-MediumItalic.ttf', 'assets/fonts/Roboto-MediumItalic.ttf');

    doc.setFont(fontRegular);

    const invoiceNumber = `INV-${new Date(reserva.fechaReserva).toISOString().split('T')[0].replace(/-/g, '')}`;
    const currentDate = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    doc.setFontSize(22);
    doc.text('Factura - Sentirse Bien', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.text(`Número de Factura: ${invoiceNumber}`, 150, 30, { align: 'right' });
    doc.text(`Fecha de Emisión: ${currentDate}`, 150, 35, { align: 'right' });

    doc.setFont('Roboto-Medium.ttf');
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
    let y = 100;
    doc.text(`Fecha: ${new Date(reserva.fechaReserva).toLocaleDateString('es-AR')}`, 20, y);
    y += 10;
    doc.text('Servicios:', 20, y);
    y += 5;
    servicios.forEach((servicio: any, index: number) => {
      doc.text(`- ${servicio.nombre} (Precio: $${servicio.precio.toFixed(2)}, Fecha: ${new Date(servicio.fecha).toLocaleDateString('es-AR')})`, 20, y + (index * 10));
    });
    y += servicios.length * 10 + 5;
    doc.text(`Medio de pago: ${medioPago}`, 20, y);
    y += 10;
    doc.text(`Valor original: $${valorOriginal.toFixed(2)}`, 20, y);
    y += 10;
    if (descuento && descuento > 0) {
      doc.text(`Descuento (15%): $${(valorOriginal * (descuento / 100)).toFixed(2)}`, 20, y);
      y += 10;
    }
    doc.text(`Total con descuento: $${valorConDescuento.toFixed(2)}`, 20, y);

    doc.setFontSize(12);
    doc.text('Gracias por elegir Sentirse Bien!', 105, y + 30, { align: 'center' });

    const pdfBlob = doc.output('blob');
    const pdfBase64 = await this.blobToBase64(pdfBlob);

    if (!cliente.email || cliente.email === 'N/A') {
      console.error('Cliente sin correo válido:', cliente);
      window.open(URL.createObjectURL(pdfBlob), '_blank');
      return Promise.reject(new Error('El cliente no tiene un correo válido.'));
    }

    const invoiceRequest = {
      email: cliente.email,
      invoiceNumber: invoiceNumber,
      attachmentBase64: pdfBase64
    };

    try {
      const response = await this.sendInvoice(invoiceRequest).toPromise();
      console.log('Correo enviado con éxito:', response);
      window.open(URL.createObjectURL(pdfBlob), '_blank');
      return Promise.resolve(invoiceNumber);
    } catch (error) {
      console.error('Error al enviar el correo, pero se abrirá el PDF localmente:', error);
      window.open(URL.createObjectURL(pdfBlob), '_blank');
      return Promise.reject(new Error('Error al enviar el correo: ' + (error as Error).message));
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private sendInvoice(invoiceRequest: any): Observable<any> {
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.warn('No se encontró token JWT en localStorage');
    }
    return this.http.post(this.apiUrl, invoiceRequest, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      catchError(error => {
        console.error('Error al enviar el correo:', error);
        return throwError(() => new Error('Error al enviar el correo: ' + error.message));
      })
    );
  }
}