import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface GeneratePDFOptions {
  elementId: string;
  filename?: string;
  onProgress?: (progress: number, message: string) => void;
}

export const generatePDF = async ({
  elementId,
  filename = 'BRIGHT_CAMPUS_BHADOHI_UP_PCS_2026_STUDIO.pdf',
  onProgress
}: GeneratePDFOptions): Promise<void> => {
  const container = document.getElementById(elementId);
  if (!container) {
    throw new Error('PDF render element not found');
  }

  onProgress?.(10, 'तैयारी की जा रही है...');

  // Target page element list or pages
  const pageElements = container.querySelectorAll<HTMLElement>('.pdf-page-unit');
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  if (pageElements.length > 0) {
    // Multi-page batch rendering for zero UI lag
    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      const stepPercent = Math.round(15 + ((i + 1) / pageElements.length) * 75);
      onProgress?.(stepPercent, `पृष्ठ ${i + 1} / ${pageElements.length} रेंडर हो रहा है...`);

      // Allow UI thread to breathe
      await new Promise(resolve => setTimeout(resolve, 60));

      const canvas = await html2canvas(pageEl, {
        scale: 2, // High clarity
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));
    }
  } else {
    // Fallback single canvas rendering if pages are in one container
    onProgress?.(40, 'कैनवास रेंडर किया जा रहा है...');
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false
    });

    onProgress?.(80, 'PDF पृष्ठ तैयार किए जा रहे हैं...');
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const imgProps = pdf.getImageProperties(imgData);
    const contentHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = contentHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, contentHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - contentHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, contentHeight);
      heightLeft -= pdfHeight;
    }
  }

  onProgress?.(98, 'PDF फ़ाइल सहेजी जा रही है...');
  pdf.save(filename);
  onProgress?.(100, 'सफलतापूर्वक डाउनलोड हो गया!');
};
