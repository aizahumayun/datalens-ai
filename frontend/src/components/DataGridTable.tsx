import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Hash,
  Tag,
  Calendar,
  ToggleLeft,
  Key,
  Info,
  X,
} from 'lucide-react';
import { ColumnMeta, DatasetAnalysis } from '../types';

interface DataGridTableProps {
  dataset: DatasetAnalysis;
}

export const DataGridTable: React.FC<DataGridTableProps> = ({ dataset }) => {
  const { columns, rawData } = dataset;

  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedColumnForStats, setSelectedColumnForStats] = useState<ColumnMeta | null>(null);

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    let result = rawData;

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) => val !== null && val !== undefined && String(val).toLowerCase().includes(query))
      );
    }

    if (sortColumn) {
      result = [...result].sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return result;
  }, [rawData, searchTerm, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (colName: string) => {
    if (sortColumn === colName) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(colName);
      setSortDirection('asc');
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'number':
        return { icon: <Hash className="w-3 h-3 text-indigo-400" />, label: 'Num', color: 'bg-indigo-500/10 text-indigo-300' };
      case 'category':
        return { icon: <Tag className="w-3 h-3 text-purple-400" />, label: 'Cat', color: 'bg-purple-500/10 text-purple-300' };
      case 'date':
        return { icon: <Calendar className="w-3 h-3 text-emerald-400" />, label: 'Date', color: 'bg-emerald-500/10 text-emerald-300' };
      case 'boolean':
        return { icon: <ToggleLeft className="w-3 h-3 text-amber-400" />, label: 'Bool', color: 'bg-amber-500/10 text-amber-300' };
      case 'id':
      default:
        return { icon: <Key className="w-3 h-3 text-slate-400" />, label: 'ID', color: 'bg-slate-800 text-slate-300' };
    }
  };

  return (
    <div className="space-y-4 my-6">
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search records across all fields..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:border-indigo-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Page Size & Record Count */}
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{filteredData.length.toLocaleString()}</strong> records
          </span>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-12 text-center text-slate-600">#</th>
                {columns.map((col) => {
                  const badge = getTypeBadge(col.type);
                  const isSorted = sortColumn === col.name;

                  return (
                    <th key={col.name} className="py-3 px-4 font-semibold whitespace-nowrap">
                      <div className="flex items-center justify-between space-x-2">
                        <button
                          onClick={() => handleSort(col.name)}
                          className="flex items-center space-x-1.5 hover:text-white transition-colors group"
                        >
                          <span className={`px-1.5 py-0.5 rounded text-[9px] flex items-center space-x-1 ${badge.color}`}>
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>
                          <span className="text-slate-200 group-hover:text-indigo-300">{col.name}</span>
                          <ArrowUpDown className={`w-3 h-3 ${isSorted ? 'text-indigo-400' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`} />
                        </button>

                        <button
                          onClick={() => setSelectedColumnForStats(col)}
                          className="p-1 text-slate-600 hover:text-indigo-400 rounded transition-colors"
                          title={`View statistics for ${col.name}`}
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center text-slate-500">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 text-center text-slate-600 text-[10px] font-mono">
                      {(currentPage - 1) * pageSize + rowIdx + 1}
                    </td>
                    {columns.map((col) => {
                      const val = row[col.name];
                      const formatted =
                        val === null || val === undefined || val === '' ? (
                          <span className="text-slate-600 italic">null</span>
                        ) : typeof val === 'number' ? (
                          <span className="font-mono text-indigo-300">{val.toLocaleString()}</span>
                        ) : (
                          String(val)
                        );

                      return (
                        <td key={col.name} className="py-2.5 px-4 whitespace-nowrap text-slate-200">
                          {formatted}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Page <strong className="text-white">{currentPage}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Column Statistics Drawer / Modal */}
      {selectedColumnForStats && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  {selectedColumnForStats.type} column
                </span>
                <h3 className="text-base font-bold text-white">{selectedColumnForStats.name}</h3>
              </div>
              <button
                onClick={() => setSelectedColumnForStats(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Numeric Stats */}
            {selectedColumnForStats.type === 'number' && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Min Value</span>
                  <p className="text-base font-bold text-white mt-0.5">{selectedColumnForStats.min?.toLocaleString()}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Max Value</span>
                  <p className="text-base font-bold text-white mt-0.5">{selectedColumnForStats.max?.toLocaleString()}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Mean (Average)</span>
                  <p className="text-base font-bold text-indigo-300 mt-0.5">{selectedColumnForStats.mean?.toLocaleString()}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Median</span>
                  <p className="text-base font-bold text-purple-300 mt-0.5">{selectedColumnForStats.median?.toLocaleString()}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2">
                  <span className="text-slate-400 text-[10px]">Total Sum</span>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">{selectedColumnForStats.sum?.toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Categorical Stats */}
            {selectedColumnForStats.type === 'category' && selectedColumnForStats.topCategories && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Value Frequencies</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedColumnForStats.topCategories.map((cat, idx) => (
                    <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                      <div className="flex justify-between font-medium text-slate-200 mb-1">
                        <span>{cat.value}</span>
                        <span className="text-indigo-400 font-bold">{cat.count} ({cat.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${cat.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 text-right">
              <button
                onClick={() => setSelectedColumnForStats(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

