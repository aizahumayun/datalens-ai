import { jsPDF } from 'jspdf';
import type { AIExecutiveReport, DatasetAnalysis } from '../types';

export function downloadDatasetReportPdf(dataset: DatasetAnalysis, report: AIExecutiveReport | null): void {
  const doc = new jsPDF();
  const cleanFileName = dataset.fileName.replace(/\.csv$/i, '');

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DataLens AI - Executive Analytics Briefing', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Dataset: ${dataset.fileName} | Date: ${new Date().toLocaleDateString()}`, 14, 22);

  let yPos = 38;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, yPos, 182, 20, 'F');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Records: ${dataset.totalRows.toLocaleString()}`, 20, yPos + 12);
  doc.text(`Variables: ${dataset.totalCols}`, 80, yPos + 12);
  doc.text(`Data Quality Score: ${dataset.summaryStats.dataQualityScore}%`, 135, yPos + 12);

  yPos += 28;
  yPos = writeKpis(doc, dataset, yPos);
  yPos = writeReportSection(doc, 'Executive Summary', report?.executiveSummary, yPos);
  yPos = writeListSection(doc, 'Key Strategic Takeaways', report?.keyInsights, yPos, true);
  yPos = writeListSection(doc, 'Actionable Recommendations', report?.recommendations, yPos, false);
  yPos = writeAnomalies(doc, dataset, yPos);
  writeFooter(doc);

  doc.save(`${cleanFileName}_Analytics_Report.pdf`);
}

export function downloadDatasetReportJson(dataset: DatasetAnalysis, report: AIExecutiveReport | null): void {
  const exportData = {
    datasetName: dataset.fileName,
    totalRows: dataset.totalRows,
    totalCols: dataset.totalCols,
    columns: dataset.columns,
    datasetKpis: dataset.datasetKpis,
    executiveReport: report,
    summaryStats: dataset.summaryStats,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${dataset.fileName.replace(/\.csv$/i, '')}_DataLens_Report.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function writeKpis(doc: jsPDF, dataset: DatasetAnalysis, yPos: number): number {
  if (!dataset.datasetKpis?.length) return yPos;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Key Dataset Performance Indicators', 14, yPos);
  yPos += 6;

  dataset.datasetKpis.forEach((kpi) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`- ${kpi.label}: `, 18, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${kpi.value} (${kpi.subtext})`, 65, yPos);
    yPos += 5.5;
  });

  return yPos + 4;
}

function writeReportSection(doc: jsPDF, title: string, content: string | undefined, yPos: number): number {
  if (!content) return yPos;
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, yPos);
  yPos += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const lines = doc.splitTextToSize(content, 180);
  doc.text(lines, 14, yPos);
  return yPos + lines.length * 4.5 + 6;
}

function writeListSection(doc: jsPDF, title: string, items: string[] | undefined, yPos: number, numbered: boolean): number {
  if (!items?.length) return yPos;
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, yPos);
  yPos += 6;

  items.forEach((item, idx) => {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const prefix = numbered ? `${idx + 1}.` : '-';
    const lines = doc.splitTextToSize(`${prefix} ${item}`, 180);
    doc.text(lines, 14, yPos);
    yPos += lines.length * 4.5 + 2;
  });

  return yPos + 4;
}

function writeAnomalies(doc: jsPDF, dataset: DatasetAnalysis, yPos: number): number {
  if (dataset.anomalies.length === 0) return yPos;
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 20, 20);
  doc.text(`Detected Outliers (${dataset.anomalies.length})`, 14, yPos);
  yPos += 6;

  dataset.anomalies.slice(0, 5).forEach((anom) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(`- Row #${anom.rowIndex} [${anom.column}]: ${anom.explanation}`, 180);
    doc.text(lines, 14, yPos);
    yPos += lines.length * 4 + 1;
  });

  return yPos;
}

function writeFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`DataLens AI Analytics Report - Page ${i} of ${pageCount}`, 14, 287);
  }
}
