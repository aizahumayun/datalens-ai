export type DatasetCellValue = string | number | boolean | null | undefined;
export type DatasetRow = Record<string, DatasetCellValue>;
export type ColumnType = 'number' | 'category' | 'date' | 'boolean' | 'id';

export interface ColumnMeta {
  name: string;
  type: ColumnType;
  sampleValues: DatasetCellValue[];
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

export interface DatasetKPI {
  id: string;
  label: string;
  value: string;
  subtext: string;
  iconName?: string;
  type?: 'primary' | 'secondary' | 'accent' | 'neutral';
}

export interface AnomalyItem {
  id: string;
  column: string;
  rowIndex: number;
  value: DatasetCellValue;
  metricName: string;
  expectedRange: string;
  zScore?: number;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface CorrelationItem {
  col1: string;
  col2: string;
  correlation: number;
  strength: 'strong_positive' | 'moderate_positive' | 'weak' | 'moderate_negative' | 'strong_negative';
}

export interface DatasetAnalysis {
  fileName: string;
  fileSize?: string;
  totalRows: number;
  totalCols: number;
  columns: ColumnMeta[];
  rawData: DatasetRow[];
  anomalies: AnomalyItem[];
  correlations: CorrelationItem[];
  datasetKpis?: DatasetKPI[];
  summaryStats: {
    numericCols: string[];
    categoryCols: string[];
    dateCols: string[];
    identifierCols: string[];
    dataQualityScore: number;
    missingDataPercentage: number;
  };
}

export interface ChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'area' | 'pie' | 'scatter';
  xKey: string;
  yKey: string;
  aggregation: 'sum' | 'mean' | 'count' | 'min' | 'max';
  groupBy?: string;
  color?: string;
  description?: string;
}

export interface AIExecutiveReport {
  executiveSummary: string;
  narrativeStory: string;
  keyInsights: string[];
  recommendations: string[];
  riskAlerts: string[];
  suggestedCharts: Omit<ChartConfig, 'id'>[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  structuredData?: {
    chartType?: 'bar' | 'line' | 'pie';
    chartData?: { name: string; value: number }[];
    statHighlight?: { label: string; value: string; detail?: string };
    tableData?: DatasetRow[];
  };
}
