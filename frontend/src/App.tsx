import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { CSVUploader } from './components/CSVUploader';
import { DataOverviewCards } from './components/DataOverviewCards';
import { AIExecutiveSummary } from './components/AIExecutiveSummary';
import { InteractiveDashboard } from './components/InteractiveDashboard';
import { DataGridTable } from './components/DataGridTable';
import { CorrelationMatrixView } from './components/CorrelationMatrixView';
import { AskDataChat } from './components/AskDataChat';
import { ExportModal } from './components/ExportModal';
import { ChartConfig, DatasetAnalysis, AIExecutiveReport } from './types';
import { parseCSVString } from './utils/dataEngine';
import { SAMPLE_DATASETS } from './data/sampleDatasets';
import { analyzeDataset } from './services/aiApi';
import { buildInitialCharts, createChartConfigsFromSuggestions } from './services/chartService';

type AppTab = 'executive' | 'dashboard' | 'data' | 'anomalies' | 'chat';
type SuggestedChart = Omit<ChartConfig, 'id'>;

export default function App() {
  const [dataset, setDataset] = useState<DatasetAnalysis | null>(null);
  const [currentTab, setCurrentTab] = useState<AppTab>('executive');
  const [aiReport, setAiReport] = useState<AIExecutiveReport | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [customCharts, setCustomCharts] = useState<ChartConfig[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  useEffect(() => {
    const defaultPreset = SAMPLE_DATASETS[0];
    if (defaultPreset) {
      void handleDatasetSelect(defaultPreset.csvContent, `${defaultPreset.name}.csv`);
    }
  }, []);

  const handleDatasetSelect = async (csvContent: string, fileName: string) => {
    try {
      setIsLoadingAI(true);
      setAppError(null);
      const parsedDataset = parseCSVString(csvContent, fileName);
      setDataset(parsedDataset);
      setIsUploadModalOpen(false);
      setCustomCharts(buildInitialCharts(parsedDataset));
      await fetchAIReport(parsedDataset);
    } catch (error) {
      setAppError(error instanceof Error ? error.message : 'Could not load this dataset. Please check the CSV and try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const fetchAIReport = async (datasetToAnalyze: DatasetAnalysis) => {
    setIsLoadingAI(true);
    try {
      const data = await analyzeDataset(datasetToAnalyze);
      if (!data.report) return;

      setAiReport(data.report);
      if (data.report.suggestedCharts?.length) {
        const suggested = createChartConfigsFromSuggestions(data.report.suggestedCharts);
        setCustomCharts((prev) => {
          const nonAiCharts = prev.filter((chart) => !chart.id.startsWith('ai-suggested-'));
          return [...suggested, ...nonAiCharts];
        });
      }
    } catch (error) {
      setAppError('AI insights are temporarily unavailable. Deterministic charts and dataset analysis are still ready.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSelectSuggestedChart = (chart: SuggestedChart) => {
    const newChart: ChartConfig = {
      id: `chart-from-ai-${Date.now()}`,
      title: chart.title,
      type: chart.type || 'bar',
      xKey: chart.xKey,
      yKey: chart.yKey,
      aggregation: chart.aggregation || 'sum',
    };
    setCustomCharts([newChart, ...customCharts]);
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        datasetName={dataset?.fileName || null}
        totalRows={dataset?.totalRows || null}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onExportReport={() => setIsExportModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {appError && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{appError}</span>
          </div>
        )}

        {(!dataset || isUploadModalOpen) && (
          <div className="mb-8">
            <CSVUploader
              onSelectDataset={handleDatasetSelect}
              isProcessing={isLoadingAI}
              onClose={() => setIsUploadModalOpen(false)}
              hasCurrentDataset={!!dataset}
            />
          </div>
        )}

        {dataset && !isUploadModalOpen && (
          <div className="space-y-6">
            <DataOverviewCards dataset={dataset} />

            {currentTab === 'executive' && (
              <AIExecutiveSummary
                report={aiReport}
                dataset={dataset}
                isLoading={isLoadingAI}
                onRefresh={() => fetchAIReport(dataset)}
                onSelectSuggestedChart={handleSelectSuggestedChart}
              />
            )}

            {currentTab === 'dashboard' && (
              <InteractiveDashboard
                dataset={dataset}
                customCharts={customCharts}
                setCustomCharts={setCustomCharts}
              />
            )}

            {currentTab === 'data' && <DataGridTable dataset={dataset} />}
            {currentTab === 'anomalies' && <CorrelationMatrixView dataset={dataset} />}
            {currentTab === 'chat' && <AskDataChat dataset={dataset} />}
          </div>
        )}
      </main>

      {isExportModalOpen && dataset && (
        <ExportModal
          report={aiReport}
          dataset={dataset}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      <footer className="border-t border-[#CBDFDE] bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DataLens AI - Automated CSV Data Analytics</span>
          <span className="text-slate-600">Intelligent insights. Better decisions.</span>
        </div>
      </footer>
    </div>
  );
}

