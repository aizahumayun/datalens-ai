import type { ChartConfig } from '../types';

export interface AggregatedChartPoint {
  name: string;
  value: number;
  count: number;
}

interface RunningChartStats {
  sum: number;
  count: number;
  min: number;
  max: number;
}

export const CHART_COLORS = [
  '#415E5B',
  '#D3A11F',
  '#3E5451',
  '#D8C896',
  '#415E5B',
  '#D3A11F',
  '#3E5451',
  '#D8C896',
];

export function aggregateDataForChart(
  rows: Record<string, unknown>[],
  xCol: string,
  yCol: string,
  aggregation: ChartConfig['aggregation'] = 'sum',
  limit = 12
): AggregatedChartPoint[] {
  if (!rows.length || !xCol) return [];

  const groupMap: Record<string, RunningChartStats> = {};

  rows.forEach((row) => {
    const rawX = row[xCol];
    const xKey = rawX !== null && rawX !== undefined && rawX !== '' ? String(rawX) : 'Unknown';
    const rawY = row[yCol];
    const yVal = typeof rawY === 'number' ? rawY : !Number.isNaN(Number(rawY)) ? Number(rawY) : 1;

    if (!groupMap[xKey]) {
      groupMap[xKey] = { sum: 0, count: 0, min: yVal, max: yVal };
    }

    groupMap[xKey].sum += yVal;
    groupMap[xKey].count += 1;
    groupMap[xKey].min = Math.min(groupMap[xKey].min, yVal);
    groupMap[xKey].max = Math.max(groupMap[xKey].max, yVal);
  });

  return Object.entries(groupMap)
    .map(([name, stats]) => ({
      name,
      value: Number(resolveAggregationValue(stats, aggregation).toFixed(2)),
      count: stats.count,
    }))
    .slice(0, limit);
}

export function buildInitialCharts(parsedDataset: {
  summaryStats: { numericCols: string[]; categoryCols: string[] };
  columns: { name: string }[];
}): ChartConfig[] {
  const initialCharts: ChartConfig[] = [];
  const catCols = parsedDataset.summaryStats.categoryCols;
  const numCols = parsedDataset.summaryStats.numericCols;

  if (catCols.length > 0 && numCols.length > 0) {
    initialCharts.push({
      id: 'chart-default-1',
      title: `Total ${numCols[0]} by ${catCols[0]}`,
      type: 'bar',
      xKey: catCols[0],
      yKey: numCols[0],
      aggregation: 'sum',
    });
  }

  if (numCols.length >= 2) {
    initialCharts.push({
      id: 'chart-default-2',
      title: `${numCols[1]} Distribution across ${catCols[0] || 'Records'}`,
      type: 'area',
      xKey: catCols[0] || parsedDataset.columns[0].name,
      yKey: numCols[1],
      aggregation: 'mean',
    });
  }

  return initialCharts;
}

export function createChartConfigsFromSuggestions(suggestions: Omit<ChartConfig, 'id'>[]): ChartConfig[] {
  const timestamp = Date.now();
  return suggestions.map((chart, idx) => ({
    id: `ai-suggested-${timestamp}-${idx}`,
    title: chart.title || `AI Suggested Chart ${idx + 1}`,
    type: chart.type || 'bar',
    xKey: chart.xKey,
    yKey: chart.yKey,
    aggregation: chart.aggregation || 'sum',
    description: chart.description,
  }));
}

function resolveAggregationValue(stats: RunningChartStats, aggregation: ChartConfig['aggregation']): number {
  if (aggregation === 'mean') return stats.count > 0 ? stats.sum / stats.count : 0;
  if (aggregation === 'count') return stats.count;
  if (aggregation === 'min') return stats.min;
  if (aggregation === 'max') return stats.max;
  return stats.sum;
}
