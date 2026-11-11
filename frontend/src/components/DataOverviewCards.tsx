import React from 'react';
import {
  FileSpreadsheet,
  Columns,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  Award,
  BarChart2,
} from 'lucide-react';
import { DatasetAnalysis } from '../types';

interface DataOverviewCardsProps {
  dataset: DatasetAnalysis;
}

export const DataOverviewCards: React.FC<DataOverviewCardsProps> = ({ dataset }) => {
  const { totalRows, totalCols, summaryStats, anomalies, datasetKpis } = dataset;

  const qualityScore = summaryStats.dataQualityScore;
  const missingPercentage = summaryStats.missingDataPercentage;

  const getQualityBadge = (score: number) => {
    if (score >= 90) {
      return { text: 'Clean & Complete', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
    if (score >= 75) {
      return { text: 'Good Quality', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    }
    return { text: 'Missing Values', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const badge = getQualityBadge(qualityScore);

  const getKpiIcon = (iconName?: string) => {
    switch (iconName) {
      case 'dollar':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-indigo-400" />;
      case 'users':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-amber-400" />;
      case 'award':
        return <Award className="w-4 h-4 text-cyan-400" />;
      default:
        return <BarChart2 className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Dataset-Aware Key Business Performance Indicators (KPIs) */}
      {datasetKpis && datasetKpis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {datasetKpis.map((kpi) => (
            <div
              key={kpi.id}
              className="bg-linear-to-b from-slate-900 to-slate-900/90 border border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl p-4 shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{kpi.label}</span>
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
                  {getKpiIcon(kpi.iconName)}
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-white tracking-tight">{kpi.value}</div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{kpi.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dataset Structure & Health Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rows Card */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Records</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">{totalRows.toLocaleString()}</div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Parsed from {dataset.fileName}</span>
            </p>
          </div>
        </div>

        {/* Column Structure Card */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Variables & Columns</span>
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Columns className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">{totalCols} Total Fields</div>
            <div className="flex items-center space-x-2 mt-1 text-[11px]">
              <span className="text-indigo-300 font-medium">{summaryStats.numericCols.length} Metrics</span>
              <span className="text-slate-600">•</span>
              <span className="text-purple-300 font-medium">{summaryStats.categoryCols.length} Categorical</span>
            </div>
          </div>
        </div>

        {/* Data Quality Score Card */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Health Score</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
              {qualityScore}%
            </span>
          </div>
          <div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-1.5">
              <div
                className="bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${qualityScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Missing: {missingPercentage}%</span>
              <span className="text-slate-300 font-medium">{badge.text}</span>
            </p>
          </div>
        </div>

        {/* Anomalies Detected Card */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Statistical Anomalies</span>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">{anomalies.length} Detected</div>
            <p className="text-[11px] text-amber-300 mt-1 flex items-center space-x-1">
              <span>
                {anomalies.length > 0
                  ? `${anomalies.filter((a) => a.severity === 'high').length} high severity outliers`
                  : 'All values within 2.3 std dev'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
