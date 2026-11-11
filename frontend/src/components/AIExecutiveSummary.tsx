import React from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AIExecutiveReport, DatasetAnalysis } from '../types';

interface AIExecutiveSummaryProps {
  report: AIExecutiveReport | null;
  dataset: DatasetAnalysis;
  isLoading: boolean;
  onRefresh: () => void;
  onSelectSuggestedChart: (chart: AIExecutiveReport['suggestedCharts'][number]) => void;
}

export const AIExecutiveSummary: React.FC<AIExecutiveSummaryProps> = ({
  report,
  dataset,
  isLoading,
  onRefresh,
  onSelectSuggestedChart,
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center my-6 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Generating AI Executive Intelligence...</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
          Gemini 3.6 is evaluating statistical distributions, anomaly patterns, correlations, and strategic business takeaways.
        </p>

        {/* Skeleton animation */}
        <div className="space-y-4 max-w-2xl mx-auto text-left">
          <div className="h-4 bg-slate-800 rounded-md w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-800 rounded-md w-full animate-pulse" />
          <div className="h-4 bg-slate-800 rounded-md w-5/6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center my-6">
        <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Ready to Analyze Dataset</h3>
        <p className="text-slate-400 text-sm mb-4">
          Click below to ask Gemini AI to generate executive insights and recommendations.
        </p>
        <button
          onClick={onRefresh}
          className="px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#415E5B] border border-[#D3A11F] rounded-xl shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all inline-flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate AI Report</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 my-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-linear-to-r from-[#415E5B] via-[#415E5B] to-[#415E5B] border border-[#CBDFDE] rounded-2xl p-6 shadow-xl gap-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-xl font-bold text-[#E3F1F1] tracking-tight">Executive AI Briefing</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-[#E3F1F1] text-xs sm:text-sm leading-relaxed">
              Automated business narrative, key performance metrics, and risk factors derived from {dataset.fileName}.
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="self-start sm:self-center px-4 py-2 text-xs font-semibold text-[#E3F1F1] hover:text-[#E3F1F1] bg-[#3E5451] hover:bg-[#415E5B] border border-[#CBDFDE] rounded-xl transition-all flex items-center space-x-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Regenerate Analysis</span>
        </button>
      </div>

      {/* Executive Summary Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-2 mb-3 text-indigo-400">
          <BookOpen className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Executive Summary
          </h3>
        </div>
        <p className="text-slate-200 text-sm leading-relaxed font-normal bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
          {report.executiveSummary}
        </p>
      </div>

      {/* Narrative Story */}
      {report.narrativeStory && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-3 text-purple-400">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Data Story & Context
            </h3>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {report.narrativeStory}
          </p>
        </div>
      )}

      {/* Two Column Grid: Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Insights */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-4 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Key Strategic Takeaways
            </h3>
          </div>
          <ul className="space-y-3">
            {report.keyInsights.map((insight, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable Recommendations */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-4 text-amber-400">
            <Lightbulb className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Actionable Business Steps
            </h3>
          </div>
          <ul className="space-y-3">
            {report.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Risk Alerts */}
      {report.riskAlerts && report.riskAlerts.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-800/40 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-3 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-200">
              Risk Factors & Anomaly Warnings
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.riskAlerts.map((alert, idx) => (
              <div key={idx} className="p-3 bg-rose-950/50 rounded-xl border border-rose-900/50 text-xs text-rose-200 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{alert}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Visualizations */}
      {report.suggestedCharts && report.suggestedCharts.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-indigo-400">
              <BarChart3 className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Recommended AI Visualizations
              </h3>
            </div>
            <span className="text-xs text-slate-400">Click any chart to load in Dashboard</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.suggestedCharts.map((chart, idx) => (
              <div
                key={idx}
                onClick={() => onSelectSuggestedChart(chart)}
                className="group p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {chart.type} chart
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {chart.xKey} vs {chart.yKey}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-100 text-sm mb-1 group-hover:text-indigo-300 transition-colors">
                    {chart.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {chart.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-indigo-400 font-medium">
                  <span>Explore in Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
