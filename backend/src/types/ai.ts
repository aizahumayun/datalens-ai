export type ColumnType = 'number' | 'category' | 'date' | 'boolean' | 'id';
export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'scatter';
export type ChartAggregation = 'sum' | 'mean' | 'count' | 'min' | 'max';

export interface ColumnMeta {
  name: string;
  type: ColumnType;
  sampleValues: unknown[];
  missingCount: number;
  uniqueCount: number;
  isIdentifier?: boolean;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  sum?: number;
  stdDev?: number;
  topCategories?: { value: string; count: number; percentage: number }[];
}

export interface DatasetAnomaly {
  id: string;
  column: string;
  rowIndex: number;
  value: number | string | null;
  metricName: string;
  expectedRange: string;
  zScore?: number;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface DatasetCorrelation {
  col1: string;
  col2: string;
  correlation: number;
  strength: 'strong_positive' | 'moderate_positive' | 'weak' | 'moderate_negative' | 'strong_negative';
}

export interface DatasetSummary {
  fileName: string;
  totalRows: number;
  totalCols: number;
  columns: ColumnMeta[];
  anomalies: DatasetAnomaly[];
  correlations: DatasetCorrelation[];
  summaryStats: {
    numericCols: string[];
    categoryCols: string[];
    dateCols: string[];
    identifierCols: string[];
    dataQualityScore: number;
    missingDataPercentage: number;
  };
}

export interface SuggestedChart {
  title: string;
  type: ChartType;
  xKey: string;
  yKey: string;
  aggregation: ChartAggregation;
  description?: string;
}

export interface AIExecutiveReport {
  executiveSummary: string;
  narrativeStory: string;
  keyInsights: string[];
  recommendations: string[];
  riskAlerts: string[];
  suggestedCharts: SuggestedChart[];
}

export interface AnalyzeDatasetRequest {
  datasetSummary?: DatasetSummary;
}

export interface AskDataRequest {
  userQuery: string;
  deterministicResult: {
    answerMarkdown?: string;
    statHighlight?: { label: string; value: string; detail?: string };
    suggestedChart?: {
      chartType: 'bar' | 'line' | 'pie';
      data: { name: string; value: number }[];
    };
    isMetricUnavailable?: boolean;
    unavailableMetricName?: string;
    availableMetrics?: string[];
  };
  datasetInfo: Pick<DatasetSummary, 'fileName' | 'totalRows' | 'totalCols' | 'columns' | 'summaryStats'>;
}

export interface AnalyzeDatasetResponse {
  report: AIExecutiveReport | null;
  isFallback?: boolean;
}

export interface AskDataResponse {
  result: {
    answer: string;
    statHighlight?: { label: string; value: string; detail?: string };
  };
}
