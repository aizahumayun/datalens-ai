import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  FileSpreadsheet,
  Download,
  BarChart3,
  Table as TableIcon,
  MessageSquareText,
  Activity,
  Zap,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'executive' | 'dashboard' | 'data' | 'anomalies' | 'chat';
  setCurrentTab: (tab: 'executive' | 'dashboard' | 'data' | 'anomalies' | 'chat') => void;
  datasetName: string | null;
  totalRows: number | null;
  onOpenUploadModal: () => void;
  onExportReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  datasetName,
  totalRows,
  onOpenUploadModal,
  onExportReport,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { key: 'executive', label: 'AI Insights', icon: Zap },
    { key: 'dashboard', label: 'Charts & KPI', icon: BarChart3 },
    { key: 'data', label: 'Data Grid', icon: TableIcon },
    { key: 'anomalies', label: 'Outliers & Correlations', icon: Activity },
    { key: 'chat', label: 'Ask Data AI', icon: MessageSquareText },
  ] as const;

  const handleNavClick = (tab: (typeof navItems)[number]['key']) => {
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="site-header sticky top-0 z-40 bg-[#415E5B] backdrop-blur border-b border-[#3E5451] text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between md:py-0 md:h-16">
          <div className="flex items-center justify-between gap-3 md:justify-start md:flex-1">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 cursor-pointer" onClick={() => setCurrentTab('executive')}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 animate-pulse" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-[#E3F1F1] to-white bg-clip-text text-transparent whitespace-nowrap">
                    DataLens
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                    AI 3.6
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#E3F1F1] hidden sm:block">Automated Data Analytics & Insights</p>
              </div>
            </div>

            {datasetName && (
              <div className="hidden sm:flex items-center min-w-0 max-w-[220px] lg:max-w-[380px] pl-3 border-l border-slate-800">
                <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-800/80 rounded-lg border border-slate-700/60 text-[11px] min-w-0">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-medium text-slate-200 truncate min-w-0">{datasetName}</span>
                  {totalRows !== null && (
                    <span className="text-slate-400 shrink-0">({totalRows.toLocaleString()} rows)</span>
                  )}
                </div>
              </div>
            )}

            {datasetName && (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 transition hover:border-slate-600 hover:bg-slate-700"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-2.5 md:ml-auto">
            {datasetName && (
              <button
                onClick={onExportReport}
                className="inline-flex md:hidden items-center justify-center h-9 w-9 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 transition hover:border-slate-600 hover:bg-slate-700"
                aria-label="Export report"
                title="Export report"
              >
                <Download className="w-3.5 h-3.5 text-slate-300" />
              </button>
            )}

            {datasetName && (
              <button
                onClick={onExportReport}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export</span>
              </button>
            )}

            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-[#FFFFFF] bg-[#415E5B] border border-[#D3A11F] hover:opacity-95 rounded-lg shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">{datasetName ? 'Switch CSV' : 'Upload CSV'}</span>
            </button>
          </div>
        </div>

        {datasetName && (
          <>
            <nav className="hidden md:flex items-center justify-center gap-1 bg-[#3E5451] p-1.5 rounded-xl border border-[#CBDFDE] overflow-x-auto">
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleNavClick(key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                    currentTab === key
                      ? 'bg-[#415E5B] text-[#FFFFFF] border border-[#D3A11F] shadow-md shadow-indigo-500/20'
                      : 'text-[#E3F1F1] hover:text-[#E3F1F1] hover:bg-[#415E5B]/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {isMobileMenuOpen && (
              <nav className="md:hidden mt-2 space-y-1 rounded-xl border border-[#CBDFDE] bg-[#3E5451] p-2">
                {navItems.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => handleNavClick(key)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                      currentTab === key ? 'bg-[#415E5B] text-[#FFFFFF] border border-[#D3A11F]' : 'text-[#E3F1F1] hover:bg-[#415E5B]/70'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {label}
                    </span>
                    {currentTab === key && <span className="h-2 w-2 rounded-full bg-white" />}
                  </button>
                ))}
              </nav>
            )}
          </>
        )}
      </div>
    </header>
  );
};
