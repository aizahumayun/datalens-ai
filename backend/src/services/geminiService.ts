import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import type { AIExecutiveReport, AnalyzeDatasetResponse, AskDataRequest, AskDataResponse, ColumnMeta, DatasetSummary } from '../types/ai.js';

function getGeminiClient() {
  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  return new GoogleGenAI({
    apiKey: env.geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'datalens-ai',
      },
    },
  });
}

export async function generateExecutiveReport(datasetSummary: DatasetSummary): Promise<AnalyzeDatasetResponse> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: buildExecutivePrompt(datasetSummary),
      config: {
        responseMimeType: 'application/json',
      },
    });

    return { report: JSON.parse(response.text || '{}') as AIExecutiveReport };
  } catch {
    return {
      report: generateFallbackReport(datasetSummary),
      isFallback: true,
    };
  }
}

export async function explainDataAnswer(body: Required<Pick<AskDataRequest, 'userQuery' | 'deterministicResult' | 'datasetInfo'>>): Promise<AskDataResponse> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: buildAskDataPrompt(body),
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}') as AskDataResponse['result'];
    return { result: parsed };
  } catch {
    return {
      result: {
        answer: body.deterministicResult.answerMarkdown || 'Calculated dataset answer available.',
        statHighlight: body.deterministicResult.statHighlight,
      },
    };
  }
}

function buildExecutivePrompt(datasetSummary: DatasetSummary): string {
  return `You are a senior data science and executive intelligence consultant analyzing a business dataset.

DATASET METADATA:
File Name: ${datasetSummary.fileName}
Total Rows: ${datasetSummary.totalRows}
Total Columns: ${datasetSummary.totalCols}
Data Quality Score: ${datasetSummary.summaryStats.dataQualityScore}%
Missing Data: ${datasetSummary.summaryStats.missingDataPercentage}%

COLUMNS & STATISTICAL SUMMARY:
${JSON.stringify(datasetSummary.columns, null, 2)}

DETECTED ANOMALIES & OUTLIERS:
${JSON.stringify(datasetSummary.anomalies, null, 2)}

CORRELATIONS BETWEEN METRICS:
${JSON.stringify(datasetSummary.correlations, null, 2)}

STRICT GROUNDING MANDATE:
Use the EXACT facts, numbers, metric sums, percentages, and anomaly counts provided above. Never invent or override statistical values.

TASK:
Analyze this dataset and generate a comprehensive executive data intelligence report.
Return JSON strictly adhering to this structure:
{
  "executiveSummary": "A concise, high-level 2-3 sentence overview of what this dataset represents and overall operational performance.",
  "narrativeStory": "A compelling 1-2 paragraph data narrative connecting key drivers, trends, and business context.",
  "keyInsights": ["Insight with specific metrics and percentages"],
  "recommendations": ["Actionable strategic recommendation"],
  "riskAlerts": ["Alert regarding anomalies, losses, or missing data risks"],
  "suggestedCharts": [
    {
      "title": "Clear descriptive chart title",
      "type": "bar",
      "xKey": "Exact column name for X axis",
      "yKey": "Exact numerical column name for Y axis",
      "aggregation": "sum",
      "description": "Why this visual is crucial for decision makers."
    }
  ]
}

Note: For xKey and yKey in suggestedCharts, MUST use EXACT non-identifier column names provided in COLUMNS list above!`;
}

function buildAskDataPrompt({ userQuery, deterministicResult, datasetInfo }: Required<Pick<AskDataRequest, 'userQuery' | 'deterministicResult' | 'datasetInfo'>>): string {
  return `You are DataLens AI, an expert conversational data analyst assistant.
You provide business context for exact calculations computed from the user's dataset.

USER QUESTION:
${userQuery}

DATASET CONTEXT:
File Name: ${datasetInfo.fileName}
Total Records: ${datasetInfo.totalRows}, Fields: ${datasetInfo.totalCols}

EXACT DETERMINISTIC CALCULATED ANSWER FROM DATASET:
${JSON.stringify(deterministicResult, null, 2)}

INSTRUCTIONS & GROUNDING RULES:
1. STRICT MANDATE: You MUST build your explanation around the exact calculated result provided above. Never invent, alter, override, or replace any calculated numbers or percentages.
2. If the result indicates a metric is unavailable, explicitly state that it is unavailable in ${datasetInfo.fileName} and list the available metrics.
3. Keep the explanation concise, professional, clear, and scannable.
4. Format output as valid JSON with:
{
  "answer": "Your formatted answer text with markdown highlights and bullet points.",
  "statHighlight": {
    "label": "${deterministicResult.statHighlight?.label || ''}",
    "value": "${deterministicResult.statHighlight?.value || ''}",
    "detail": "${deterministicResult.statHighlight?.detail || ''}"
  }
}`;
}

function generateFallbackReport(datasetSummary: DatasetSummary): AIExecutiveReport {
  const { fileName, totalRows, totalCols, columns, anomalies, summaryStats } = datasetSummary;
  const numCols = columns.filter((c) => c.type === 'number' && !c.isIdentifier);
  const catCols = columns.filter((c) => c.type === 'category' && !c.isIdentifier);
  const dateCols = columns.filter((c) => c.type === 'date' && !c.isIdentifier);

  const topNum = numCols[0];
  const secondNum = numCols[1];
  const topCat = catCols[0];
  const keyInsights = buildFallbackInsights(datasetSummary, topNum, topCat);

  return {
    executiveSummary: `Analysis of ${fileName} (${totalRows.toLocaleString()} rows, ${totalCols} fields) demonstrates a ${summaryStats.dataQualityScore}% data health rating. Key drivers centered around ${topNum?.name || 'primary metrics'} indicate structured overall metrics with ${anomalies.length} detected statistical outliers.`,
    narrativeStory: `The dataset ${fileName} reflects operational activity across ${catCols.length} categorical segments and ${numCols.length} numerical metrics. Performance in ${topNum?.name || 'core field'} shows structured volume aggregation, supported by balanced variance across records.`,
    keyInsights,
    recommendations: [
      `Focus optimization efforts on high-volume categories in field '${topCat?.name || 'Category'}'.`,
      `Monitor ${anomalies.length} detected statistical outliers to prevent operational distortion.`,
      `Maintain high data quality standards across all ${totalCols} recorded variables.`,
    ],
    riskAlerts:
      anomalies.length > 0
        ? [`${anomalies.length} extreme outlier records detected outside 2.3 standard deviations.`]
        : [`Low data missingness (${summaryStats.missingDataPercentage}%) ensures high statistical fidelity.`],
    suggestedCharts: buildFallbackCharts(topCat, topNum, secondNum, dateCols[0]),
  };
}

function buildFallbackInsights(datasetSummary: DatasetSummary, topNum?: ColumnMeta, topCat?: ColumnMeta): string[] {
  const { anomalies, summaryStats } = datasetSummary;
  const keyInsights: string[] = [];

  if (topNum?.sum !== undefined) {
    keyInsights.push(`Total ${topNum.name} accumulated across all records stands at $${topNum.sum.toLocaleString()} (Average $${topNum.mean?.toLocaleString()} per record).`);
  }
  if (topCat?.topCategories?.length) {
    const topVal = topCat.topCategories[0];
    keyInsights.push(`Dominant segment in ${topCat.name} is "${topVal.value}", accounting for ${topVal.percentage}% (${topVal.count} records) of total volume.`);
  }
  keyInsights.push(`Dataset health score is evaluated at ${summaryStats.dataQualityScore}% with ${summaryStats.missingDataPercentage}% missing cell values.`);
  if (anomalies.length > 0) {
    keyInsights.push(`Identified ${anomalies.length} statistical anomaly/anomalies (Z-score > 2.3) requiring operational review.`);
  }

  return keyInsights;
}

function buildFallbackCharts(topCat?: ColumnMeta, topNum?: ColumnMeta, secondNum?: ColumnMeta, dateCol?: ColumnMeta): AIExecutiveReport['suggestedCharts'] {
  const charts: AIExecutiveReport['suggestedCharts'] = [];

  if (topCat && topNum) {
    charts.push({
      title: `Total ${topNum.name} by ${topCat.name}`,
      type: 'bar',
      xKey: topCat.name,
      yKey: topNum.name,
      aggregation: 'sum',
      description: `Reveals performance distribution of ${topNum.name} across ${topCat.name} segments.`,
    });
  }

  if (dateCol && topNum) {
    charts.push({
      title: `${topNum.name} Trend over Time`,
      type: 'line',
      xKey: dateCol.name,
      yKey: topNum.name,
      aggregation: 'sum',
      description: `Tracks time-series momentum for ${topNum.name}.`,
    });
  } else if (secondNum && topCat) {
    charts.push({
      title: `Average ${secondNum.name} Distribution`,
      type: 'area',
      xKey: topCat.name,
      yKey: secondNum.name,
      aggregation: 'mean',
      description: `Compares mean ${secondNum.name} per ${topCat.name}.`,
    });
  }

  return charts;
}

