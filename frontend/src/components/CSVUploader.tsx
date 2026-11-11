import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Activity,
  BarChart3,
  Users,
  ArrowRight,
  ShieldCheck,
  Cpu,
  BarChart2,
} from 'lucide-react';
import { SAMPLE_DATASETS, SampleDatasetPreset } from '../data/sampleDatasets';

interface CSVUploaderProps {
  onSelectDataset: (csvContent: string, fileName: string) => void;
  isProcessing: boolean;
  onClose?: () => void;
  hasCurrentDataset?: boolean;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({
  onSelectDataset,
  isProcessing,
  onClose,
  hasCurrentDataset = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setErrorMsg('Please upload a valid .csv file format.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('File size exceeds 20MB limit.');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        onSelectDataset(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePresetSelect = (preset: SampleDatasetPreset) => {
    setErrorMsg(null);
    onSelectDataset(preset.csvContent, `${preset.name}.csv`);
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-indigo-400" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-emerald-400" />;
      case 'BarChart3':
        return <BarChart3 className="w-5 h-5 text-purple-400" />;
      case 'Users':
        return <Users className="w-5 h-5 text-pink-400" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 3.6 Automated Data Analytics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Instant CSV Data Intelligence
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Upload any CSV spreadsheet or click a sample dataset to generate automated KPI metrics, interactive charts, anomaly detection, and executive AI insights.
        </p>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 mb-10 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-700/80 hover:border-indigo-500/60 bg-slate-900/60 hover:bg-slate-900/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400 shadow-inner">
          {isProcessing ? (
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-lg font-bold text-white mb-1">
          {isProcessing ? 'Analyzing Dataset Structure...' : 'Drop your CSV file here, or click to browse'}
        </h3>
        <p className="text-xs text-slate-400 mb-4">Supports UTF-8 CSV files up to 20MB</p>

        <div className="inline-flex items-center space-x-2 text-xs text-indigo-300 bg-indigo-950/80 px-4 py-2 rounded-lg border border-indigo-800/50">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Client-side local parsing + Secure server-side AI aggregation</span>
        </div>

        {errorMsg && (
          <div className="mt-4 inline-flex items-center space-x-2 text-xs text-rose-300 bg-rose-950/80 border border-rose-800/60 px-4 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Preset Sample Datasets */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Or Try One-Click Sample Datasets
            </h2>
          </div>
          <span className="text-xs text-slate-400">Instant demo dataset load</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_DATASETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className="group relative bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-indigo-500/10"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                    {getPresetIcon(preset.iconName)}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {preset.badge}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-100 text-sm mb-1 group-hover:text-indigo-300 transition-colors">
                  {preset.name}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {preset.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-medium text-indigo-400 group-hover:text-indigo-300">
                <span>Load Dataset</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features summary pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center space-x-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
          <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Automatic Type Inference & Summary Metrics</span>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
          <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Z-Score & IQR Anomaly Outlier Detection</span>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Gemini AI Business Story & Recommendations</span>
        </div>
      </div>

      {hasCurrentDataset && onClose && (
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4"
          >
            Cancel and return to current dataset
          </button>
        </div>
      )}
    </div>
  );
};

