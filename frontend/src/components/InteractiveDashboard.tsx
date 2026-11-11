import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  Settings2,
  Plus,
  Trash2,
  BarChart2,
} from 'lucide-react';
import { ChartConfig, DatasetAnalysis } from '../types';
import { aggregateDataForChart, CHART_COLORS, AggregatedChartPoint } from '../services/chartService';

interface InteractiveDashboardProps {
  dataset: DatasetAnalysis;
  customCharts: ChartConfig[];
  setCustomCharts: React.Dispatch<React.SetStateAction<ChartConfig[]>>;
}

export const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({
  dataset,
  customCharts,
  setCustomCharts,
}) => {
  const { columns, rawData, summaryStats } = dataset;

  // Filter out identifier columns for meaningful visualizations
  const numericCols = summaryStats.numericCols;
  const categoryCols = summaryStats.categoryCols;
  const dateCols = summaryStats.dateCols;

  const validDimensions = [...dateCols, ...categoryCols];
  const validMeasures = numericCols;

  // New Chart Form State
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie'>('bar');
  const [xKey, setXKey] = useState<string>(validDimensions[0] || categoryCols[0] || columns[0]?.name || '');
  const [yKey, setYKey] = useState<string>(validMeasures[0] || numericCols[0] || columns[1]?.name || '');
  const [aggregation, setAggregation] = useState<'sum' | 'mean' | 'count' | 'min' | 'max'>('sum');
  const [chartTitle, setChartTitle] = useState<string>('');
  const [isAddingChart, setIsAddingChart] = useState<boolean>(false);

  const handleAddChart = () => {
    if (!xKey || !yKey) return;
    const title = chartTitle.trim() || `${aggregation.toUpperCase()} of ${yKey} by ${xKey}`;
    const newChart: ChartConfig = {
      id: `chart-${Date.now()}`,
      title,
      type: chartType,
      xKey,
      yKey,
      aggregation,
    };
    setCustomCharts([newChart, ...customCharts]);
    setChartTitle('');
    setIsAddingChart(false);
  };

  const handleDeleteChart = (id: string) => {
    setCustomCharts(customCharts.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6 my-6 min-w-0 overflow-hidden">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-4 gap-4 min-w-0">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Interactive Data Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400">
            {customCharts.length} active chart{customCharts.length === 1 ? '' : 's'} derived from {dataset.fileName}
          </p>
        </div>

        <button
          onClick={() => setIsAddingChart(!isAddingChart)}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center space-x-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAddingChart ? 'Close Builder' : 'Create Custom Chart'}</span>
        </button>
      </div>

      {/* Chart Builder Form */}
      {isAddingChart && (
        <div className="bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-3">
            <Settings2 className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Chart Configurator</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Chart Type */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Chart Type</label>
              <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                    chartType === 'bar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Bar Chart"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('line')}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                    chartType === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Line Chart"
                >
                  <LineChartIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('area')}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                    chartType === 'area' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Area Chart"
                >
                  <AreaChartIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('pie')}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                    chartType === 'pie' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Pie Chart"
                >
                  <PieChartIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* X-Axis Dimension */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">X-Axis (Group By)</label>
              <select
                value={xKey}
                onChange={(e) => setXKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none"
              >
                {validDimensions.length > 0
                  ? validDimensions.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))
                  : columns.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
              </select>
            </div>

            {/* Y-Axis Measure */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Y-Axis (Metric)</label>
              <select
                value={yKey}
                onChange={(e) => setYKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none"
              >
                {validMeasures.length > 0
                  ? validMeasures.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))
                  : columns.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
              </select>
            </div>

            {/* Aggregation Function */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Aggregation</label>
              <select
                value={aggregation}
                onChange={(e) => setAggregation(e.target.value as ChartConfig['aggregation'])}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none"
              >
                <option value="sum">Sum</option>
                <option value="mean">Average (Mean)</option>
                <option value="count">Record Count</option>
                <option value="max">Maximum</option>
                <option value="min">Minimum</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-3 gap-4">
            <input
              type="text"
              placeholder={`Title e.g. "${aggregation.toUpperCase()} of ${yKey} by ${xKey}"`}
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              className="w-full sm:w-2/3 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none"
            />

            <button
              onClick={handleAddChart}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#415E5B] border border-[#D3A11F] text-[#FFFFFF] font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all cursor-pointer"
            >
              Add Chart to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Grid of Chart Cards */}
      {customCharts.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-10 text-center my-6">
          <BarChart2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Visual Charts Available</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto mb-4 leading-relaxed">
            Add a numerical field together with a categorical or date field to generate a meaningful visualization.
          </p>
          <button
            onClick={() => setIsAddingChart(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-500/20 inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Build First Chart</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
          {customCharts.map((chart) => {
            const chartData = aggregateDataForChart(rawData, chart.xKey, chart.yKey, chart.aggregation, 12);

            return (
              <div
                key={chart.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition-all min-w-0 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm tracking-tight truncate">{chart.title}</h3>
                    <p className="text-[11px] text-slate-400 truncate">
                      {chart.aggregation.toUpperCase()} of <span className="text-indigo-300">{chart.yKey}</span> by{' '}
                      <span className="text-purple-300">{chart.xKey}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteChart(chart.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                    title="Remove chart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Responsive Chart Container */}
                <div className="h-64 sm:h-72 w-full pt-2 min-w-0">
                  {chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      No valid numerical data available for selected fields.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      {renderChartComponent(chart.type, chartData)}
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function renderChartComponent(type: ChartConfig['type'], data: AggregatedChartPoint[]) {
  const formatXTick = (val: unknown) => {
    const str = String(val ?? '');
    return str.length > 10 ? `${str.slice(0, 8)}…` : str;
  };

  const formatYTick = (val: unknown): string => {
    if (typeof val === 'number') {
      if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(0)}k`;
    }
    return String(val ?? '');
  };

  switch (type) {
    case 'line':
      return (
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 35 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#CBDFDE" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#3E5451"
            fontSize={10}
            tickLine={false}
            interval="preserveStartEnd"
            angle={-25}
            textAnchor="end"
            tickFormatter={formatXTick}
          />
          <YAxis stroke="#3E5451" fontSize={10} tickLine={false} width={42} tickFormatter={formatYTick} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#415E5B"
            strokeWidth={3}
            dot={{ fill: '#D3A11F', stroke: '#3E5451', strokeWidth: 1, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      );

    case 'area':
      return (
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 35 }}>
          <defs>
            <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#415E5B" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#415E5B" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#CBDFDE" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#3E5451"
            fontSize={10}
            tickLine={false}
            interval="preserveStartEnd"
            angle={-25}
            textAnchor="end"
            tickFormatter={formatXTick}
          />
          <YAxis stroke="#3E5451" fontSize={10} tickLine={false} width={42} tickFormatter={formatYTick} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="value" stroke="#415E5B" strokeWidth={2.5} fillOpacity={1} fill="url(#areaColor)" />
        </AreaChart>
      );

    case 'pie':
      return (
        <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            outerRadius={75}
            innerRadius={40}
            paddingAngle={3}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="#3E5451" />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(val) => <span className="text-[10px] text-slate-300">{val}</span>}
          />
        </PieChart>
      );

    case 'bar':
    default:
      return (
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 35 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#CBDFDE" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#3E5451"
            fontSize={10}
            tickLine={false}
            interval="preserveStartEnd"
            angle={-25}
            textAnchor="end"
            tickFormatter={formatXTick}
          />
          <YAxis stroke="#3E5451" fontSize={10} tickLine={false} width={42} tickFormatter={formatYTick} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="#3E5451" />
            ))}
          </Bar>
        </BarChart>
      );
  }
}

interface ChartTooltipProps { active?: boolean; payload?: Array<{ value?: string | number | null }>; label?: string; }

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;

    return (
      <div className="bg-slate-950 border border-slate-700 p-2.5 rounded-xl shadow-2xl text-xs text-slate-200">
        <p className="font-bold text-white mb-1">{label}</p>
        <p className="text-indigo-400 font-semibold">
          Value: {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    );
  }
  return null;
};


