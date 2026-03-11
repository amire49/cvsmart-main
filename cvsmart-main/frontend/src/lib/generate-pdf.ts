import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/**
 * Capture an element and produce a multi-page A4 PDF.
 * Uses html2canvas-pro which natively supports oklch(), oklab(), color-mix() etc.
 */
export async function generatePdfFromElement(
  element: HTMLElement,
  filename = "improved_cv.pdf",
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    scrollX: 0,
    scrollY: 0,
  });

  const imgWidthPx = canvas.width;
  const imgHeightPx = canvas.height;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pdfImgWidth = A4_WIDTH_MM;
  const pdfImgHeight = (imgHeightPx * A4_WIDTH_MM) / imgWidthPx;

  if (pdfImgHeight <= A4_HEIGHT_MM) {
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      pdfImgWidth,
      pdfImgHeight,
    );
  } else {
    const pageHeightPx = (A4_HEIGHT_MM / A4_WIDTH_MM) * imgWidthPx;
    const totalPages = Math.ceil(imgHeightPx / pageHeightPx);

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();
      const srcY = page * pageHeightPx;
      const sliceHeight = Math.min(pageHeightPx, imgHeightPx - srcY);

      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = imgWidthPx;
      sliceCanvas.height = sliceHeight;
      const ctx = sliceCanvas.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(
        canvas,
        0,
        srcY,
        imgWidthPx,
        sliceHeight,
        0,
        0,
        imgWidthPx,
        sliceHeight,
      );

      const sliceMmHeight = (sliceHeight * A4_WIDTH_MM) / imgWidthPx;
      pdf.addImage(
        sliceCanvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        pdfImgWidth,
        sliceMmHeight,
      );
    }
  }

  pdf.save(filename);
}
