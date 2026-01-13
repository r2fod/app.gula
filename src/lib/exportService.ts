// ------------------------------------------------------------------
// Archivo: exportService.ts
// Descripción: Servicio centralizado para generación de archivos y enlaces de compartición.
// Soporta PDF (con tablas), Excel, Email (mailto) y WhatsApp.
// ------------------------------------------------------------------

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Genera y descarga un PDF con una tabla de datos.
 * @param title Título del documento
 * @param columns array de strings con los nombres de columna
 * @param data array de arrays con los valores
 * @param filename nombre del archivo a descargar
 */
export const generatePDF = (title: string, columns: string[], data: any[][], filename: string) => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Fecha
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);

  // Tabla
  autoTable(doc, {
    head: [columns],
    body: data,
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [66, 66, 66] }
  });

  doc.save(`${filename}.pdf`);
};

/**
 * Genera y descarga un archivo Excel (.xlsx).
 * @param data Array de objetos JSON
 * @param sheetName Nombre de la hoja
 * @param filename Nombre del archivo
 */
export const generateExcel = (data: any[], sheetName: string, filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Genera un enlace de WhatsApp Web/App.
 * @param phoneNumber Número de teléfono (prefijo internacional sin +)
 * @param message Mensaje a enviar
 */
export const generateWhatsAppLink = (phoneNumber: string, message: string) => {
  const encodedMessage = encodeURIComponent(message);
  // Eliminar espacios y símbolos del número
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Genera un enlace mailto.
 * @param to Destinatario
 * @param subject Asunto
 * @param body Cuerpo del mensaje
 */
export const generateEmailLink = (to: string, subject: string, body: string) => {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
