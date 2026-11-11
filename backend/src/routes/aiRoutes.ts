import { Router } from 'express';
import { explainDataAnswer, generateExecutiveReport } from '../services/geminiService.js';
import type { AnalyzeDatasetRequest, AskDataRequest } from '../types/ai.js';

export const aiRoutes = Router();

aiRoutes.post('/ai/analyze-dataset', async (req, res) => {
  const { datasetSummary } = req.body as AnalyzeDatasetRequest;
  if (!datasetSummary) {
    res.status(400).json({ error: 'datasetSummary is required' });
    return;
  }

  const result = await generateExecutiveReport(datasetSummary);
  res.json(result);
});

aiRoutes.post('/ai/ask-data', async (req, res) => {
  const { userQuery, deterministicResult, datasetInfo } = req.body as AskDataRequest;
  if (!userQuery || !datasetInfo || !deterministicResult) {
    res.status(400).json({ error: 'userQuery, deterministicResult, and datasetInfo are required' });
    return;
  }

  const result = await explainDataAnswer({ userQuery, deterministicResult, datasetInfo });
  res.json(result);
});
