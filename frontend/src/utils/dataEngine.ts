import Papa from 'papaparse';
import { AnomalyItem, ColumnMeta, ColumnType, CorrelationItem, DatasetAnalysis, DatasetKPI, DatasetCellValue, DatasetRow } from '../types';

export function parseCSVString(csvText: string, fileName: string = 'dataset.csv'): DatasetAnalysis {
  const parsed = Papa.parse<DatasetRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  const rawRows = parsed.data || [];
  if (rawRows.length === 0) {
    throw new Error('CSV file is empty or invalid.');
  }

  const columns = analyzeColumns(rawRows);

  const identifierCols = columns.filter((c) => c.isIdentifier || c.type === 'id').map((c) => c.name);
  const numericCols = columns.filter((c) => c.type === 'number' && !c.isIdentifier).map((c) => c.name);
  const categoryCols = columns.filter((c) => c.type === 'category' && !c.isIdentifier).map((c) => c.name);
  const dateCols = columns.filter((c) => c.type === 'date' && !c.isIdentifier).map((c) => c.name);

  // Calculate missing value score
  let totalCells = rawRows.length * columns.length;
  let missingCells = 0;
  columns.forEach((col) => {
    missingCells += col.missingCount;
  });

  const missingPercentage = totalCells > 0 ? (missingCells / totalCells) * 100 : 0;
  const dataQualityScore = Math.max(0, Math.min(100, Math.round(100 - missingPercentage * 1.5)));

  // Filter out identifiers before anomalies & correlations
  const nonIdColumns = columns.filter((c) => !c.isIdentifier && c.type !== 'id');
  const anomalies = detectAnomalies(rawRows, nonIdColumns);
  const correlations = calculateCorrelations(rawRows, numericCols);

  const datasetAnalysis: DatasetAnalysis = {
    fileName,
    fileSize: `${(csvText.length / 1024).toFixed(1)} KB`,
    totalRows: rawRows.length,
    totalCols: columns.length,
    columns,
    rawData: rawRows,
    anomalies,
    correlations,
    summaryStats: {
      numericCols,
      categoryCols,
      dateCols,
      identifierCols,
      dataQualityScore,
      missingDataPercentage: Number(missingPercentage.toFixed(1)),
    },
  };

  datasetAnalysis.datasetKpis = generateDatasetKPIs(datasetAnalysis);

  return datasetAnalysis;
}

export function isIdentifierColumn(colName: string, values: DatasetCellValue[], totalRows: number): boolean {
  const norm = colName.trim().toLowerCase().replace(/[\s\-_]/g, '');

  const idKeywords = [
    'id',
    'index',
    'idx',
    'customerid',
    'userid',
    'accountid',
    'orderid',
    'transactionid',
    'serialnumber',
    'sequencenumber',
    'seq',
    'rownum',
    'rowid',
    'employeeid',
    'productid',
    'patientid',
    'studentid',
  ];

  if (idKeywords.some((kw) => norm === kw || norm.endsWith('id') || norm.endsWith('index'))) {
    return true;
  }

  if (values.length > 0) {
    const validNums = values.map((v) => Number(v)).filter((v) => !isNaN(v) && Number.isInteger(v));
    if (validNums.length / values.length > 0.85) {
      const uniqueCount = new Set(validNums).size;
      const uniquenessRatio = uniqueCount / totalRows;

      if (uniquenessRatio > 0.95) {
        if (norm.includes('num') || norm.includes('no') || norm.includes('code') || norm.includes('index') || norm.includes('id')) {
          return true;
        }
      }
    }
  }

  return false;
}

function analyzeColumns(rows: DatasetRow[]): ColumnMeta[] {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]);

  return keys.map((key) => {
    const values = rows.map((r) => r[key]);
    const validValues = values.filter((v) => v !== null && v !== undefined && v !== '' && !Number.isNaN(v));
    const missingCount = rows.length - validValues.length;

    const isId = isIdentifierColumn(key, validValues, rows.length);
    const inferredType: ColumnType = isId ? 'id' : detectColumnType(key, validValues);
    const uniqueSet = new Set(validValues.map((v) => String(v).trim().toLowerCase()));
    const uniqueCount = uniqueSet.size;

    const meta: ColumnMeta = {
      name: key,
      type: inferredType,
      sampleValues: validValues.slice(0, 5),
      missingCount,
      uniqueCount,
      isIdentifier: isId || inferredType === 'id',
    };

    if (inferredType === 'number' && !isId) {
      const numValues = validValues.map((v) => Number(v)).filter((v) => !Number.isNaN(v));
      if (numValues.length > 0) {
        numValues.sort((a, b) => a - b);
        const sum = numValues.reduce((acc, curr) => acc + curr, 0);
        const mean = sum / numValues.length;
        const min = numValues[0];
        const max = numValues[numValues.length - 1];

        const mid = Math.floor(numValues.length / 2);
        const median = numValues.length % 2 !== 0 ? numValues[mid] : (numValues[mid - 1] + numValues[mid]) / 2;

        const variance = numValues.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / numValues.length;
        const stdDev = Math.sqrt(variance);

        meta.min = Number(min.toFixed(2));
        meta.max = Number(max.toFixed(2));
        meta.mean = Number(mean.toFixed(2));
        meta.median = Number(median.toFixed(2));
        meta.sum = Number(sum.toFixed(2));
        meta.stdDev = Number(stdDev.toFixed(2));
      }
    } else if (inferredType === 'category') {
      const freqMap: Record<string, number> = {};
      validValues.forEach((v) => {
        const strVal = String(v).trim();
        freqMap[strVal] = (freqMap[strVal] || 0) + 1;
      });

      const topCategories = Object.entries(freqMap)
        .map(([value, count]) => ({
          value,
          count,
          percentage: Number(((count / validValues.length) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      meta.topCategories = topCategories;
    }

    return meta;
  });
}

function detectColumnType(colName: string, values: DatasetCellValue[]): ColumnType {
  const lowerName = colName.toLowerCase();

  if (lowerName.endsWith('_id') || lowerName.endsWith('id') || lowerName === 'id' || lowerName.startsWith('id_')) {
    return 'id';
  }

  if (values.length === 0) return 'category';

  let numCount = 0;
  let dateCount = 0;
  let boolCount = 0;

  for (const v of values.slice(0, 50)) {
    if (typeof v === 'boolean' || String(v).toLowerCase() === 'true' || String(v).toLowerCase() === 'false') {
      boolCount++;
    } else if (typeof v === 'number') {
      numCount++;
    } else if (typeof v === 'string') {
      const trimmed = v.trim();
      if (!isNaN(Number(trimmed)) && trimmed !== '') {
        numCount++;
      } else if (!isNaN(Date.parse(trimmed)) && (trimmed.includes('-') || trimmed.includes('/') || trimmed.includes(':'))) {
        dateCount++;
      }
    }
  }

  const sampleLen = Math.min(values.length, 50);

  if (boolCount / sampleLen > 0.8) return 'boolean';
  if (numCount / sampleLen > 0.8) return 'number';
  if (dateCount / sampleLen > 0.8 || lowerName.includes('date') || lowerName.includes('time')) return 'date';

  return 'category';
}

export function detectAnomalies(rows: DatasetRow[], columns: ColumnMeta[]): AnomalyItem[] {
  const anomalies: AnomalyItem[] = [];
  const numericCols = columns.filter(
    (c) => c.type === 'number' && !c.isIdentifier && c.mean !== undefined && c.stdDev !== undefined && c.stdDev > 0
  );

  numericCols.forEach((col) => {
    const mean = col.mean!;
    const stdDev = col.stdDev!;

    rows.forEach((row, idx) => {
      const rawVal = row[col.name];
      if (rawVal !== null && rawVal !== undefined && !isNaN(Number(rawVal))) {
        const val = Number(rawVal);
        const zScore = (val - mean) / stdDev;

        if (Math.abs(zScore) >= 2.3) {
          const isHigh = val > mean;
          anomalies.push({
            id: `anom-${col.name}-${idx}`,
            column: col.name,
            rowIndex: idx + 1,
            value: val,
            metricName: col.name,
            expectedRange: `${(mean - 2 * stdDev).toFixed(1)} to ${(mean + 2 * stdDev).toFixed(1)}`,
            zScore: Number(zScore.toFixed(2)),
            severity: Math.abs(zScore) >= 3.0 ? 'high' : 'medium',
            explanation: `${col.name} value of ${val} is ${Math.abs(zScore).toFixed(1)} standard deviations ${
              isHigh ? 'above' : 'below'
            } the column mean (${mean}).`,
          });
        }
      }
    });
  });

  // Check for negative profit losses if Profit column exists
  rows.forEach((row, idx) => {
    if ('Profit' in row && Number(row['Profit']) < -50) {
      if (!anomalies.some((a) => a.rowIndex === idx + 1 && a.column === 'Profit')) {
        anomalies.push({
          id: `anom-profit-neg-${idx}`,
          column: 'Profit',
          rowIndex: idx + 1,
          value: row['Profit'],
          metricName: 'Net Profit Loss',
          expectedRange: '≥ $0',
          severity: 'high',
          explanation: `Transaction incurred a net operational loss of $${Math.abs(Number(row['Profit']))}.`,
        });
      }
    }
  });

  return anomalies.slice(0, 10);
}

export function calculateCorrelations(rows: DatasetRow[], numericCols: string[]): CorrelationItem[] {
  if (numericCols.length < 2) return [];

  const pairs: CorrelationItem[] = [];

  for (let i = 0; i < numericCols.length; i++) {
    for (let j = i + 1; j < numericCols.length; j++) {
      const col1 = numericCols[i];
      const col2 = numericCols[j];

      const vals1: number[] = [];
      const vals2: number[] = [];

      rows.forEach((r) => {
        const v1 = Number(r[col1]);
        const v2 = Number(r[col2]);
        if (!isNaN(v1) && !isNaN(v2)) {
          vals1.push(v1);
          vals2.push(v2);
        }
      });

      if (vals1.length > 5) {
        const rVal = pearsonCorrelation(vals1, vals2);
        if (!isNaN(rVal)) {
          let strength: CorrelationItem['strength'] = 'weak';
          if (rVal >= 0.6) strength = 'strong_positive';
          else if (rVal >= 0.3) strength = 'moderate_positive';
          else if (rVal <= -0.6) strength = 'strong_negative';
          else if (rVal <= -0.3) strength = 'moderate_negative';

          if (Math.abs(rVal) >= 0.2) {
            pairs.push({
              col1,
              col2,
              correlation: Number(rVal.toFixed(2)),
              strength,
            });
          }
        }
      }
    }
  }

  return pairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    num += diffX * diffY;
    denX += diffX * diffX;
    denY += diffY * diffY;
  }

  if (denX === 0 || denY === 0) return 0;
  return num / Math.sqrt(denX * denY);
}

export function generateDatasetKPIs(dataset: DatasetAnalysis): DatasetKPI[] {
  const { columns, rawData, totalRows } = dataset;
  const nonIdCols = columns.filter((c) => !c.isIdentifier && c.type !== 'id');
  const numericCols = nonIdCols.filter((c) => c.type === 'number');

  const kpis: DatasetKPI[] = [];

  // Helper for column search
  const findCol = (keywords: string[]) => {
    return numericCols.find((c) => keywords.some((kw) => c.name.toLowerCase().includes(kw)));
  };

  const revCol = findCol(['sales', 'revenue', 'mrr', 'gross_sales', 'total_revenue']);
  const profitCol = findCol(['profit', 'net_profit', 'margin']);
  const salaryCol = findCol(['salary', 'compensation', 'pay']);
  const spendCol = findCol(['spend', 'ad_spend', 'budget', 'cost']);
  const orderCol = findCol(['quantity', 'orders', 'units']);
  const scoreCol = findCol(['rating', 'nps', 'performance', 'score']);

  if (revCol && revCol.sum !== undefined) {
    const label = revCol.name.toLowerCase().includes('mrr') ? 'Total MRR' : 'Total Revenue';
    kpis.push({
      id: 'kpi-rev',
      label,
      value: `$${revCol.sum.toLocaleString()}`,
      subtext: `Avg $${revCol.mean?.toLocaleString()} per transaction`,
      iconName: 'dollar',
      type: 'primary',
    });
  }

  if (profitCol && profitCol.sum !== undefined) {
    kpis.push({
      id: 'kpi-profit',
      label: 'Net Profit',
      value: `$${profitCol.sum.toLocaleString()}`,
      subtext: `Highest record: $${profitCol.max?.toLocaleString()}`,
      iconName: 'trending',
      type: profitCol.sum >= 0 ? 'accent' : 'secondary',
    });
  }

  if (salaryCol && salaryCol.mean !== undefined) {
    kpis.push({
      id: 'kpi-salary',
      label: 'Average Salary',
      value: `$${salaryCol.mean.toLocaleString()}`,
      subtext: `Total Payroll: $${salaryCol.sum?.toLocaleString()}`,
      iconName: 'users',
      type: 'primary',
    });
  }

  if (spendCol && spendCol.sum !== undefined) {
    kpis.push({
      id: 'kpi-spend',
      label: 'Total Ad Spend',
      value: `$${spendCol.sum.toLocaleString()}`,
      subtext: `Avg $${spendCol.mean?.toLocaleString()} per campaign`,
      iconName: 'dollar',
      type: 'secondary',
    });
  }

  if (orderCol && orderCol.sum !== undefined) {
    kpis.push({
      id: 'kpi-orders',
      label: `Total ${orderCol.name}`,
      value: orderCol.sum.toLocaleString(),
      subtext: `Avg ${orderCol.mean?.toLocaleString()} per record`,
      iconName: 'shopping',
      type: 'neutral',
    });
  }

  if (scoreCol && scoreCol.mean !== undefined) {
    kpis.push({
      id: 'kpi-score',
      label: `Average ${scoreCol.name}`,
      value: `${scoreCol.mean} / ${scoreCol.max || 10}`,
      subtext: `Evaluated across ${totalRows} records`,
      iconName: 'award',
      type: 'accent',
    });
  }

  // Fallback KPIs if no keyword matched
  if (kpis.length < 2) {
    for (const numCol of numericCols) {
      if (!kpis.some((k) => k.label.includes(numCol.name)) && numCol.sum !== undefined) {
        kpis.push({
          id: `kpi-col-${numCol.name}`,
          label: `Total ${numCol.name}`,
          value: numCol.sum > 1000 ? `$${numCol.sum.toLocaleString()}` : numCol.sum.toLocaleString(),
          subtext: `Average: ${numCol.mean?.toLocaleString()}`,
          iconName: 'bar',
          type: 'neutral',
        });
        if (kpis.length >= 4) break;
      }
    }
  }

  return kpis.slice(0, 4);
}


