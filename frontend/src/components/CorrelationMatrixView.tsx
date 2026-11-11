import React from 'react';
import { Activity, GitCompare, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { DatasetAnalysis } from '../types';

interface CorrelationMatrixViewProps {
  dataset: DatasetAnalysis;
}

export const CorrelationMatrixView: React.FC<CorrelationMatrixViewProps> = ({ dataset }) => {
  const { anomalies, correlations } = dataset;

  return (
    <div className="space-y-6 my-6 min-w-0 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 text-amber-400 mb-2">
          <Activity className="w-6 h-6" />
          <h2 className="text-xl font-bold text-white tracking-tight">Anomalies & Variable Correlations</h2>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm">
          Automated Z-Score statistical anomaly detection paired with Pearson correlation matrix across numerical variables.
        </p>
      </div>

      {/* Outliers Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Detected Outliers ({anomalies.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Z-Score &gt; 2.3 std dev</span>
        </div>

        {anomalies.length === 0 ? (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">All Metrics Within Normal Range</h4>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              No statistical anomalies or outliers were detected in this dataset.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-2"
              >
                <div
                  className={`flex items-center justify-between ${
                    anom.metricName === 'Duplicate File Count' ? 'flex-wrap gap-2 sm:flex-nowrap sm:gap-0' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{anom.metricName}</span>
                    <span className="text-[10px] text-slate-500">Row #{anom.rowIndex}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      anom.severity === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {anom.severity} severity
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{anom.explanation}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>
                    Observed: <strong className="text-rose-400 font-mono">{anom.value}</strong>
                  </span>
                  <span>Expected: <strong className="text-slate-300">{anom.expectedRange}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Correlations Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-indigo-400">
            <GitCompare className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Pearson Correlation Strengths ({correlations.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Range: -1.0 to +1.0</span>
        </div>

        {correlations.length === 0 ? (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-8 text-center space-y-2">
            <Info className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Relationship Analysis Available</h4>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              At least two meaningful numerical fields are required to discover relationships between metrics.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {correlations.map((corr, idx) => {
              const isPositive = corr.correlation > 0;
              return (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">
                      {corr.col1} &amp; {corr.col2}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {corr.correlation > 0 ? `+${corr.correlation}` : corr.correlation}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span className="capitalize">{corr.strength.replace('_', ' ')} relationship</span>
                    <span className="text-slate-500">{Math.round(Math.abs(corr.correlation) * 100)}% align</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
