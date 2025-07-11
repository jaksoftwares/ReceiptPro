import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Receipt } from '../types';
import { format } from 'date-fns';

export const generateReceiptPDF = async (receipt: Receipt, elementId: string): Promise<void> => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error('Receipt element not found');
  }

  try {
    // Create high-resolution canvas optimized for mobile and desktop
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution for crisp text
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: 1200, // Fixed width for consistency
      windowHeight: 1600, // Fixed height for consistency
      scrollX: 0,
      scrollY: 0,
      logging: false, // Disable logging for cleaner output
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Calculate dimensions for A4 page
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF with optimized settings
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    // Generate filename with receipt number and date
    const fileName = `receipt-${receipt.receiptNumber}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    
    // Save the PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF generation error:', error);
    
    // Fallback to quick PDF generation if html2canvas fails
    generateQuickPDF(receipt);
  }
};

export const generateQuickPDF = (receipt: Receipt): void => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;
    
    // Header with business info
    pdf.setFontSize(24);
    pdf.setTextColor(59, 130, 246); // Blue color
    pdf.text('RECEIPT', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Receipt #: ${receipt.receiptNumber}`, 20, yPosition);
    pdf.text(`Date: ${format(new Date(receipt.transactionDate), 'MM/dd/yyyy')}`, pageWidth - 20, yPosition, { align: 'right' });
    
    yPosition += 10;
    pdf.text(`Payment: ${receipt.paymentMethod.replace('_', ' ').toUpperCase()}`, pageWidth - 20, yPosition, { align: 'right' });
    
    yPosition += 20;
    
    // Business info
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('From:', 20, yPosition);
    pdf.text('To:', pageWidth / 2 + 10, yPosition);
    
    yPosition += 8;
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    
    // From section
    const fromLines = [
      receipt.businessProfile.name,
      receipt.businessProfile.email,
      receipt.businessProfile.phone,
      receipt.businessProfile.address,
      `${receipt.businessProfile.city}, ${receipt.businessProfile.state} ${receipt.businessProfile.zipCode}`,
      receipt.businessProfile.country
    ].filter(Boolean);
    
    fromLines.forEach((line, index) => {
      pdf.text(line, 20, yPosition + (index * 5));
    });
    
    // To section
    const toLines = [
      receipt.customerName,
      receipt.customerEmail,
      receipt.customerPhone,
      receipt.customerAddress
    ].filter(Boolean);
    
    toLines.forEach((line, index) => {
      pdf.text(line, pageWidth / 2 + 10, yPosition + (index * 5));
    });
    
    yPosition += Math.max(fromLines.length, toLines.length) * 5 + 15;
    
    // Items table header
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text('Description', 20, yPosition);
    pdf.text('Qty', pageWidth - 80, yPosition, { align: 'center' });
    pdf.text('Price', pageWidth - 60, yPosition, { align: 'right' });
    pdf.text('Amount', pageWidth - 20, yPosition, { align: 'right' });
    
    yPosition += 5;
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 8;
    
    // Items
    pdf.setFont(undefined, 'normal');
    receipt.items.forEach((item) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(item.description, 20, yPosition);
      pdf.text(item.quantity.toString(), pageWidth - 80, yPosition, { align: 'center' });
      pdf.text(`${receipt.currency} ${item.price.toFixed(2)}`, pageWidth - 60, yPosition, { align: 'right' });
      pdf.text(`${receipt.currency} ${item.amount.toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 6;
    });
    
    yPosition += 10;
    pdf.line(pageWidth - 100, yPosition, pageWidth - 20, yPosition);
    yPosition += 8;
    
    // Totals
    const totalsX = pageWidth - 100;
    pdf.text(`Subtotal: ${receipt.currency} ${receipt.subtotal.toFixed(2)}`, totalsX, yPosition, { align: 'left' });
    yPosition += 6;
    
    if (receipt.discountAmount > 0) {
      pdf.text(`Discount: ${receipt.currency} ${receipt.discountAmount.toFixed(2)}`, totalsX, yPosition, { align: 'left' });
      yPosition += 6;
    }
    
    if (receipt.taxAmount > 0) {
      pdf.text(`Tax: ${receipt.currency} ${receipt.taxAmount.toFixed(2)}`, totalsX, yPosition, { align: 'left' });
      yPosition += 6;
    }
    
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(12);
    pdf.text(`Total: ${receipt.currency} ${receipt.total.toFixed(2)}`, totalsX, yPosition, { align: 'left' });
    
    // Notes
    if (receipt.notes) {
      yPosition += 20;
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('Notes:', 20, yPosition);
      yPosition += 6;
      pdf.setFont(undefined, 'normal');
      const noteLines = pdf.splitTextToSize(receipt.notes, pageWidth - 40);
      pdf.text(noteLines, 20, yPosition);
    }
    
    // Download
    const fileName = `receipt-${receipt.receiptNumber}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Quick PDF generation error:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};