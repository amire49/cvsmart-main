import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

type ExportPdfOptions = {
  element: HTMLElement;
  filename?: string;
  format?: "a4";
  scale?: number;
  marginMm?: number;
};

export async function exportElementToPdf({
  element,
  filename = "cv.pdf",
  format = "a4",
  scale = 2,
  marginMm = 10,
}: ExportPdfOptions) {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    width: element.offsetWidth,
    height: element.offsetHeight,
  });

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format });
  const pdfPageWidth = pdf.internal.pageSize.getWidth();
  const pdfPageHeight = pdf.internal.pageSize.getHeight();

  const contentWidth = pdfPageWidth - 2 * marginMm;
  const contentHeight = pdfPageHeight - 2 * marginMm;

  const fitScale = contentWidth / imgWidth;
  const scaledWidth = contentWidth;
  const scaledHeight = imgHeight * fitScale;

  if (scaledHeight <= contentHeight) {
    const dataUrl = canvas.toDataURL("image/png", 1.0);
    pdf.addImage(dataUrl, "PNG", marginMm, marginMm, scaledWidth, scaledHeight);
    pdf.save(filename);
    return;
  }

  const sliceHeightPx = contentHeight / fitScale;
  let sourceY = 0;
  while (sourceY < imgHeight) {
    const sliceH = Math.min(sliceHeightPx, imgHeight - sourceY);
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = imgWidth;
    sliceCanvas.height = Math.ceil(sliceH);
    const ctx = sliceCanvas.getContext("2d");
    if (!ctx) throw new Error("Failed to create PDF canvas");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, imgWidth, sliceCanvas.height);
    ctx.drawImage(canvas, 0, sourceY, imgWidth, sliceH, 0, 0, imgWidth, sliceH);

    const sliceDataUrl = sliceCanvas.toDataURL("image/png", 1.0);
    const slicePdfHeight = sliceH * fitScale;

    pdf.addPage();
    pdf.addImage(sliceDataUrl, "PNG", marginMm, marginMm, scaledWidth, slicePdfHeight);

    sourceY += sliceH;
  }
  pdf.deletePage(1);
  pdf.save(filename);
}

