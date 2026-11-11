import { postJson } from './apiClient';
import type { AIExecutiveReport, DatasetAnalysis } from '../types';
import type { CalculatedQueryResult } from '../utils/askDataEngine';

export interface AnalyzeDatasetResponse {
  report: AIExecutiveReport | null;
  isFallback?: boolean;
}

interface AnalyzeDatasetPayload {
  datasetSummary: Pick<DatasetAnalysis, 'fileName' | 'totalRows' | 'totalCols' | 'columns' | 'anomalies' | 'correlations' | 'summaryStats'>;
}

interface AskDataPayload {
  userQuery: string;
  deterministicResult: CalculatedQueryResult;
  datasetInfo: Pick<DatasetAnalysis, 'fileName' | 'totalRows' | 'totalCols' | 'columns' | 'summaryStats'>;
}

interface AskDataResponse {
  result?: {
    answer?: string;
    statHighlight?: { label: string; value: string; detail?: string };
  };
}

export function analyzeDataset(dataset: DatasetAnalysis): Promise<AnalyzeDatasetResponse> {
  const payload: AnalyzeDatasetPayload = {
    datasetSummary: {
      fileName: dataset.fileName,
      totalRows: dataset.totalRows,
      totalCols: dataset.totalCols,
      columns: dataset.columns,
      anomalies: dataset.anomalies,
      correlations: dataset.correlations,
      summaryStats: dataset.summaryStats,
    },
  };

  return postJson<AnalyzeDatasetResponse, AnalyzeDatasetPayload>('/api/ai/analyze-dataset', payload);
}

export function askData(payload: AskDataPayload): Promise<AskDataResponse> {
  return postJson<AskDataResponse, AskDataPayload>('/api/ai/ask-data', payload);
}
