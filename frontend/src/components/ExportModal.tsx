import React, { useState } from 'react';
import { X, Download, Sparkles, CheckCircle2, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { AIExecutiveReport, DatasetAnalysis } from '../types';
import { downloadDatasetReportJson, downloadDatasetReportPdf } from '../services/exportService';

interface ExportModalProps {
  report: AIExecutiveReport | null;
  dataset: DatasetAnalysis;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ report, dataset, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExportPDF = () => {
    setIsExporting(true);
    setExportError(null);

    try {
      downloadDatasetReportPdf(dataset, report);
    } catch (error) {
      setExportError('Could not generate PDF file. Please try downloading again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadJSON = () => {
    downloadDatasetReportJson(dataset, report);
  };
  return (
    <div className="fixed inset-0 z-50 bg-[#3E5451]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-4 sm:p-6 md:p-8 shadow-2xl space-y-4 sm:space-y-6 my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3 sm:pb-4">
          <div className="flex items-start space-x-2 sm:space-x-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-white leading-tight">Export Dataset Intelligence Report</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 break-words">{dataset.fileName} - DataLens AI Report Generator</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close export dialog"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800">
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block">Total Records</span>
            <span className="text-sm sm:text-lg font-bold text-white break-words">{dataset.totalRows.toLocaleString()}</span>
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block">Variables</span>
            <span className="text-sm sm:text-lg font-bold text-indigo-300 break-words">{dataset.totalCols}</span>
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block">Data Quality</span>
            <span className="text-sm sm:text-lg font-bold text-emerald-400 break-words">{dataset.summaryStats.dataQualityScore}%</span>
          </div>
        </div>

        {exportError && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}

        {report && (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Executive Summary</h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 break-words">
                {report.executiveSummary}
              </p>
            </div>

            <div>
              <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Insights Summary</h3>
              <ul className="space-y-2">
                {report.keyInsights.slice(0, 3).map((insight, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="break-words">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch justify-end gap-3 pt-3 sm:pt-4 border-t border-slate-800">
          <button
            onClick={handleDownloadJSON}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#415E5B] border border-[#D3A11F] hover:opacity-95 text-[#FFFFFF] font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Download PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
