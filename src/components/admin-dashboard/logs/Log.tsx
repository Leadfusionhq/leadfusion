"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { LOG_API } from "@/utils/apiUrl";
import axiosWrapper from "@/utils/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import DataTable, { TableColumn } from "react-data-table-component";
import {
  Dialog,
  DialogContent,
  Skeleton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import {
  Search,
  Trash2,
  RefreshCw,
  Activity,
  Server,
  X,
  Eye,
  Copy,
  Zap,
  CheckCircle2,
  Download,
  FileJson,
  FileSpreadsheet,
  PlayCircle,
  PauseCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import React from "react";

// Define Log type
type LogEntry = {
  _id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  meta?: Record<string, any>;
};

type ApiResponse = {
  success: boolean;
  data: LogEntry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
};

type StatsResponse = {
  success: boolean;
  data: {
    total: number;
    todayCount: number;
    errorCount24h: number;
    byLevel: Record<string, number>;
  };
};

const LOG_LEVELS = ["INFO", "WARN", "ERROR", "DEBUG", "SUCCESS"];

const customStyles = {
  table: {
    style: {
      backgroundColor: '#ffffff',
    },
  },
  headRow: {
    style: {
      backgroundColor: '#f8fafc',
      borderBottomWidth: '1px',
      borderBottomColor: '#e2e8f0',
      minHeight: '48px',
    },
  },
  headCells: {
    style: {
      fontSize: '0.7rem',
      fontWeight: '700',
      color: '#64748b',
      paddingLeft: '24px',
      paddingRight: '24px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
  },
  rows: {
    style: {
      minHeight: '60px',
      fontSize: '0.875rem',
      color: '#334155',
      borderBottomWidth: '1px',
      borderBottomColor: '#f1f5f9',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#f8fafc',
        cursor: 'pointer',
      },
    },
  },
  cells: {
    style: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },
};

export default function LogsTable() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<StatsResponse["data"] | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50 });
  const [totalRows, setTotalRows] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filters
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [searchMessage, setSearchMessage] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // UI
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    log: LogEntry | null;
  }>({ open: false, log: null });
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const token = useSelector((state: RootState) => state.auth.token);

  const fetchStats = useCallback(async () => {
    try {
      const response = (await axiosWrapper(
        "get",
        LOG_API.GET_STATS,
        {},
        token ?? undefined
      )) as StatsResponse;

      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, [token]);

  const fetchLogs = useCallback(
    async (
      pageNumber: number,
      pageSize: number,
      level: string,
      message: string,
      start: string,
      end: string,
      skipLoading = false
    ) => {
      try {
        if (!skipLoading) setLoading(true);

        const params = new URLSearchParams({
          page: pageNumber.toString(),
          limit: pageSize.toString(),
          ...(level && { level }),
          ...(message && { message }),
          ...(start && { startDate: start }),
          ...(end && { endDate: end }),
        });

        const response = (await axiosWrapper(
          "get",
          `${LOG_API.GET_ALL_LOGS}?${params.toString()}`,
          {},
          token ?? undefined
        )) as ApiResponse;

        if (response.success) {
          setLogs(response.data || []);
          setTotalRows(response.meta?.total || 0);
        }
      } catch (err: any) {
        console.error("Failed to fetch logs:", err);
        if (!skipLoading) toast.error("Failed to fetch logs");
      } finally {
        if (!skipLoading) setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchLogs(pagination.page, pagination.limit, selectedLevel, searchMessage, startDate, endDate);
    }
  }, [token, pagination.page, pagination.limit, selectedLevel, searchMessage, startDate, endDate, fetchLogs, fetchStats]);

  // Auto Refresh Logic
  useEffect(() => {
    if (isAutoRefresh) {
      autoRefreshIntervalRef.current = setInterval(() => {
        fetchLogs(pagination.page, pagination.limit, selectedLevel, searchMessage, startDate, endDate, true);
        fetchStats();
      }, 5000); // 5 seconds
    } else {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    }
    return () => {
      if (autoRefreshIntervalRef.current) clearInterval(autoRefreshIntervalRef.current);
    };
  }, [isAutoRefresh, fetchLogs, fetchStats, pagination, selectedLevel, searchMessage, startDate, endDate]);


  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchLogs(pagination.page, pagination.limit, selectedLevel, searchMessage, startDate, endDate),
      fetchStats()
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
    toast.success("Logs refreshed");
  };

  const handleClearFilters = () => {
    setSelectedLevel("");
    setSearchMessage("");
    setStartDate("");
    setEndDate("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearLogs = async () => {
    try {
      const params = new URLSearchParams({
        ...(selectedLevel && { level: selectedLevel }),
        ...(startDate && { beforeDate: endDate || new Date().toISOString() }),
      });

      const response = (await axiosWrapper(
        "delete",
        `${LOG_API.CLEAR_LOGS}?${params.toString()}`,
        {},
        token ?? undefined
      )) as { success: boolean; deletedCount: number; message: string };

      if (response.success) {
        toast.success(response.message);
        setClearDialogOpen(false);
        handleRefresh();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to clear logs");
    }
  };

  // Export Functionality
  const handleExport = (type: 'csv' | 'json') => {
    if (!logs.length) return;

    const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm");
    const filename = `system_logs_${timestamp}`;

    if (type === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", filename + ".json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } else if (type === 'csv') {
      const headers = ["ID", "Timestamp", "Level", "Message", "Meta"];
      const csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(",") + "\n"
        + logs.map(row => {
          const metaStr = row.meta ? JSON.stringify(row.meta).replace(/"/g, '""') : "";
          return `"${row._id}","${row.timestamp}","${row.level}","${row.message.replace(/"/g, '""')}","${metaStr}"`;
        }).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename + ".csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    setAnchorEl(null);
    toast.success(`Exported ${logs.length} logs to ${type.toUpperCase()}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getLevelBadge = (level: string) => {
    const styles = {
      info: "bg-blue-50 text-blue-700 border-blue-200",
      warn: "bg-amber-50 text-amber-700 border-amber-200",
      error: "bg-red-50 text-red-700 border-red-200",
      debug: "bg-gray-50 text-gray-700 border-gray-200",
      success: "bg-green-50 text-green-700 border-green-200",
    };
    const style = styles[level as keyof typeof styles] || styles.debug;

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${style}`}>
        {level}
      </span>
    );
  };

  const getStatCount = (map: Record<string, number> | undefined, key: string) => {
    if (!map) return 0;
    return map[key] || map[key.toUpperCase()] || map[key.toLowerCase()] || 0;
  };

  // Custom Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="p-4 space-y-4">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-1">
          <Skeleton variant="rounded" width={60} height={20} />
          <div className="flex-col gap-1 w-24">
            <Skeleton variant="text" width={80} />
          </div>
          <Skeleton variant="text" sx={{ flex: 1 }} />
          <Skeleton variant="circular" width={20} height={20} />
        </div>
      ))}
    </div>
  );

  const columns: TableColumn<LogEntry>[] = [
    {
      name: "Status",
      selector: (row) => row.level,
      cell: (row) => getLevelBadge(row.level),
      width: "90px",
    },
    {
      name: "Timestamp",
      selector: (row) => row.timestamp,
      cell: (row) => (
        <span className="text-xs font-mono text-gray-500">
          {format(new Date(row.timestamp), "MMM dd HH:mm:ss")}
        </span>
      ),
      width: "140px",
      sortable: true,
    },
    {
      name: "Message",
      selector: (row) => row.message,
      cell: (row) => (
        <div className="py-2">
          <p className="text-sm text-gray-700 truncate font-medium max-w-xl" title={row.message}>
            {row.message}
          </p>
        </div>
      ),
      grow: 1,
    },
    {
      name: "",
      cell: (row) => (
        <div className="flex justify-end w-full">
          <button
            onClick={(e) => { e.stopPropagation(); setDetailDialog({ open: true, log: row }); }}
            className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-blue-600 rounded transition-colors"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
      width: "60px",
    },
  ];

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen space-y-6 max-w-[1600px] mx-auto">
      {/* Compact Header & Stats Panel */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">System Logs</h1>
            <div className="w-px h-4 bg-gray-200"></div>

            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isAutoRefresh
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                }`}
            >
              {isAutoRefresh ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  Paused
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-2 shadow-sm"
            >
              <Download size={14} />
              Export
            </button>

            <button
              onClick={handleRefresh}
              className={`p-1.5 hover:bg-gray-50 rounded-lg text-gray-500 hover:text-gray-900 transition-all ${isRefreshing ? 'opacity-70' : ''}`}
            >
              <RefreshCw size={16} className={`${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <button
              onClick={() => setClearDialogOpen(true)}
              disabled={!stats?.total}
              className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline disabled:opacity-50 disabled:no-underline"
            >
              Clear Data
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 bg-white">
            <div className="p-5 flex items-center gap-4 group hover:bg-gray-50/50 transition-colors">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Server size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Volume</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-gray-900 leading-none">{stats.total.toLocaleString()}</h3>
                </div>
              </div>
            </div>

            <div className="p-5 flex items-center gap-4 group hover:bg-gray-50/50 transition-colors">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Today</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-gray-900 leading-none">{stats.todayCount.toLocaleString()}</h3>
                </div>
              </div>
            </div>

            <div className="p-5 flex items-center gap-4 group hover:bg-gray-50/50 transition-colors">
              <div className={`p-3 rounded-lg transition-colors ${stats.errorCount24h > 0 ? 'bg-red-50 text-red-600 group-hover:bg-red-100' : 'bg-green-50 text-green-600'}`}>
                {stats.errorCount24h > 0 ? <Zap size={20} /> : <CheckCircle2 size={20} />}
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Critical Errors</p>
                <div className="flex items-baseline gap-2">
                  <h3 className={`text-2xl font-bold leading-none ${stats.errorCount24h > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.errorCount24h.toLocaleString()}</h3>
                  <span className="text-[10px] text-gray-400 font-medium">Last 24h</span>
                </div>
              </div>
            </div>

            <div className="p-5 flex flex-col justify-center gap-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-gray-500">Distribution</span>
              </div>
              <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-gray-100">
                <div className="bg-red-500 h-full" style={{ width: `${(getStatCount(stats.byLevel, 'error') / stats.total) * 100}%` }} title="Errors"></div>
                <div className="bg-amber-400 h-full" style={{ width: `${(getStatCount(stats.byLevel, 'warn') / stats.total) * 100}%` }} title="Warnings"></div>
                <div className="bg-blue-500 h-full flex-1" title="Info"></div>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-medium text-gray-500">
                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> {getStatCount(stats.byLevel, 'error')} Err</span>
                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> {getStatCount(stats.byLevel, 'warn')} Wrn</span>
                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {getStatCount(stats.byLevel, 'info')} Info</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col min-h-[500px]">
        {/* Compact Filters */}
        <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between sticky top-0 z-20">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="Filter logs..."
              value={searchMessage}
              onChange={(e) => setSearchMessage(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium cursor-pointer hover:border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="">All Levels</option>
              {LOG_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>

            <input
              type="date"
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium cursor-pointer hover:border-gray-300 outline-none text-gray-600"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            {(selectedLevel || searchMessage || startDate || endDate) && (
              <button
                onClick={handleClearFilters}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                title="Clear filters"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="relative flex-1">
          {loading && (
            <div className="absolute inset-0 bg-white z-10 transition-opacity duration-200">
              <LoadingSkeleton />
            </div>
          )}

          <DataTable
            columns={columns}
            data={logs}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationDefaultPage={pagination.page}
            paginationPerPage={pagination.limit}
            paginationRowsPerPageOptions={[25, 50, 100]}
            onChangePage={(page) => setPagination(prev => ({ ...prev, page }))}
            onChangeRowsPerPage={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
            customStyles={customStyles}
            highlightOnHover
            pointerOnHover
            responsive
            striped={false}
            onRowClicked={(row) => setDetailDialog({ open: true, log: row })}
            noDataComponent={
              <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                <Search size={32} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">No system logs found</p>
              </div>
            }
          />
        </div>
      </div>

      {/* Export Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          style: { borderRadius: '12px', marginTop: '8px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }
        }}
      >
        <MenuItem onClick={() => handleExport('csv')} className="text-sm gap-2 text-gray-700">
          <ListItemIcon style={{ minWidth: 'auto' }}>
            <FileSpreadsheet size={16} />
          </ListItemIcon>
          <ListItemText primary="Export as CSV" primaryTypographyProps={{ fontSize: '0.875rem' }} />
        </MenuItem>
        <MenuItem onClick={() => handleExport('json')} className="text-sm gap-2 text-gray-700">
          <ListItemIcon style={{ minWidth: 'auto' }}>
            <FileJson size={16} />
          </ListItemIcon>
          <ListItemText primary="Export as JSON" primaryTypographyProps={{ fontSize: '0.875rem' }} />
        </MenuItem>
      </Menu>

      {/* Dialogs remain similar but cleaner */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, log: null })}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: { borderRadius: '12px' }
        }}
      >
        {detailDialog.log && (
          <div className="bg-white">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-900">Log Details</span>
                <span className="text-xs font-mono text-gray-400">#{detailDialog.log._id.slice(-8)}</span>
              </div>
              <button
                onClick={() => setDetailDialog({ open: false, log: null })}
                className="text-gray-400 hover:text-gray-900"
              >
                <X size={18} />
              </button>
            </div>

            <DialogContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</h4>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm font-mono text-gray-800 break-words relative group">
                    {detailDialog.log.message}
                    <button
                      onClick={() => copyToClipboard(detailDialog.log!.message)}
                      className="absolute top-2 right-2 p-1.5 bg-white shadow-sm border border-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Metadata</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      {getLevelBadge(detailDialog.log.level)}
                      <span className="text-gray-300">|</span>
                      <span className="font-mono">{format(new Date(detailDialog.log.timestamp), "yyyy-MM-dd HH:mm:ss")}</span>
                    </div>
                  </div>
                </div>

                {detailDialog.log.meta && Object.keys(detailDialog.log.meta).length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Payload</span>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(detailDialog.log!.meta, null, 2))}
                        className="text-[10px] text-blue-600 font-bold hover:underline"
                      >
                        COPY JSON
                      </button>
                    </h4>
                    <div className="bg-[#1e1e1e] rounded-lg p-4 overflow-x-auto">
                      <pre className="text-xs font-mono text-gray-300">
                        {JSON.stringify(detailDialog.log.meta, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </div>
        )}
      </Dialog>

      {/* Clear Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        maxWidth="xs"
        PaperProps={{ style: { borderRadius: '12px' } }}
      >
        <div className="p-6 text-center">
          <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={20} />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Clear Logs?</h3>
          <p className="text-xs text-gray-500 mb-6">
            Permanently delete logs {selectedLevel ? `matching "${selectedLevel}"` : ""}.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setClearDialogOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleClearLogs}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Confirm
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}