import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Primary method: html2canvas → jsPDF
 * Clones the element into a fixed off-screen container so layout is stable.
 */
export async function generatePDF(elementId: string, filename: string): Promise<void> {
  const source = document.getElementById(elementId);
  if (!source) throw new Error('Preview element not found');

  // Clone into a fixed-size off-screen container so mm-based widths resolve correctly
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 0; left: -9999px;
    width: 794px;
    background: white;
    z-index: -1;
  `;
  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.width = '794px';
  clone.style.minHeight = 'auto';
  clone.style.overflow = 'visible';
  container.appendChild(clone);
  document.body.appendChild(container);

  // Wait for fonts/images to settle
  await new Promise(r => setTimeout(r, 300));

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794,
      height: clone.scrollHeight,
      windowWidth: 794,
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

    const pageW = pdf.internal.pageSize.getWidth();   // 595.28 pt
    const pageH = pdf.internal.pageSize.getHeight();  // 841.89 pt

    const imgW = pageW;
    const imgH = (canvas.height * pageW) / canvas.width;

    let yOffset = 0;
    while (yOffset < imgH) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, -yOffset, imgW, imgH, undefined, 'FAST');
      yOffset += pageH;
    }

    pdf.save(filename);
  } catch (err) {
    document.body.removeChild(container);
    throw err;
  }
}

/**
 * Fallback: opens a print dialog — user can "Save as PDF" from browser.
 * Works 100% of the time regardless of CSS complexity.
 */
export function printAsPDF(elementId: string): void {
  const source = document.getElementById(elementId);
  if (!source) return;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) { window.print(); return; }

  // Copy all stylesheets into the new window
  const styles = Array.from(document.styleSheets)
    .map(ss => {
      try {
        return Array.from(ss.cssRules).map(r => r.cssText).join('\n');
      } catch { return ''; }
    })
    .join('\n');

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice</title>
        <style>
          ${styles}
          @page { size: A4 portrait; margin: 0; }
          body { margin: 0; background: white; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        </style>
      </head>
      <body>${source.outerHTML}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
}
