import { useState, useEffect, useCallback } from 'react';
import {
    Drawer,
    IconButton,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    CircularProgress,
    Pagination,
    Button,
    Stack,
    Chip
} from '@mui/material';
import { X, RefreshCcw, FileText } from 'lucide-react';
import { API_URL } from '@/utils/apiUrl';
import axiosWrapper from '@/utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import dayjs from 'dayjs';

interface UserLogsDrawerProps {
    open: boolean;
    onClose: () => void;
    userId: string | null;
    userName: string;
}

// Interfaces based on the CsvLogsPage structure
interface LogItem {
    _id?: string;
    id?: number;
    log_type?: string;
    logType?: string;
    level?: string;
    module?: string;
    message?: string;
    source?: string | null;
    source_type?: string;
    metadata?: any;
    stack?: string | null;
    created_at?: string;
    createdAt?: string;
    timestamp?: string;
}

interface PaginatedResponse<T> {
    data: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

export default function UserLogsDrawer({
    open,
    onClose,
    userId,
    userName
}: UserLogsDrawerProps) {
    const token = useSelector((state: RootState) => state.auth.token);
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const fetchLogs = useCallback(async () => {
        if (!userId || !open) return;

        try {
            setLoading(true);
            const params = {
                page,
                limit
            };

            const response = await axiosWrapper(
                "get",
                API_URL.USERS_LOGS.replace(':userId', userId),
                { params },
                token || undefined
            ) as PaginatedResponse<LogItem>;

            if (response && response.data) {
                setLogs(response.data);

                // Read from nested pagination object inside the response
                const paginationData = (response as any).pagination || {};
                const payloadCount = paginationData.total ?? ((response as any).totalCount || (response as any).total || response.total || 0);
                const payloadPages = paginationData.pages ?? paginationData.totalPages ?? ((response as any).totalPages || response.totalPages || Math.ceil(payloadCount / limit));

                setTotalCount(payloadCount);
                setTotalPages(payloadPages);
            } else if (response && Array.isArray(response)) {
                // In case it comes back as an array directly without pagination wrapper
                setLogs(response as any);
            }
        } catch (error) {
            console.error("Failed to fetch user logs:", error);
        } finally {
            setLoading(false);
        }
    }, [userId, open, page, limit, token]);

    useEffect(() => {
        if (open) {
            fetchLogs();
        } else {
            // Reset state when closed
            setLogs([]);
            setPage(1);
        }
    }, [open, userId, fetchLogs]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const getLogTypeColor = (type: string) => {
        const colors: Record<string, { bg: string, text: string, border: string }> = {
            error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
            warning: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
            info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
            success: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
        };
        const defaultColor = { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
        return colors[type?.toLowerCase()] || defaultColor;
    };


    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', md: '80vw', lg: '70vw', xl: '60vw' }, maxWidth: '1400px' }
            }}
        >
            <Box className="flex flex-col h-full bg-white">
                {/* Header */}
                <Box className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <Typography variant="h4" className="font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            User Logs
                        </Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center" className="mt-2">
                            <Typography variant="body2" className="text-gray-500 font-medium">
                                Logs for:
                            </Typography>
                            <Chip
                                label={userName}
                                size="small"
                                className="font-semibold bg-gray-100 text-gray-700 border-none"
                            />
                        </Stack>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={fetchLogs}
                            disabled={loading}
                            variant="outlined"
                            color="inherit"
                            className="border-gray-200 text-gray-700 hover:bg-gray-50"
                            startIcon={<RefreshCcw size={16} className={loading ? "animate-spin" : ""} />}
                        >
                            Refresh
                        </Button>
                        <IconButton
                            onClick={onClose}
                            className="bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors w-10 h-10 rounded-full"
                        >
                            <X size={20} />
                        </IconButton>
                    </div>
                </Box>

                {/* Content */}
                <Box className="flex-1 overflow-auto bg-gray-50/30 p-8">

                    {loading ? (
                        <Box className="flex flex-col items-center justify-center h-64 gap-3">
                            <CircularProgress size={40} thickness={4} className="text-black" />
                            <Typography variant="body2" className="text-gray-500 font-medium animate-pulse">Loading logs...</Typography>
                        </Box>
                    ) : logs.length > 0 ? (
                        <Paper elevation={0} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                            <TableContainer className="max-h-[calc(100vh-250px)]">
                                <Table stickyHeader size="medium">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell className="bg-gray-50/90 backdrop-blur-sm px-6 py-5 border-b border-gray-100 min-w-[150px]">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Timestamp</span>
                                            </TableCell>
                                            <TableCell className="bg-gray-50/90 backdrop-blur-sm px-6 py-5 border-b border-gray-100 min-w-[120px]">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Type</span>
                                            </TableCell>
                                            <TableCell className="bg-gray-50/90 backdrop-blur-sm px-6 py-5 border-b border-gray-100 min-w-[140px]">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Module & Type</span>
                                            </TableCell>
                                            <TableCell className="bg-gray-50/90 backdrop-blur-sm px-6 py-5 border-b border-gray-100 w-1/2">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Message & Metadata</span>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {logs.map((log, index) => {
                                            const typeColors = getLogTypeColor(log.level || log.log_type || '');
                                            const dateToUse = log.createdAt || log.timestamp || log.created_at;
                                            return (
                                                <TableRow key={log._id || log.id || index} hover className="group transition-colors border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                                    <TableCell className="px-6 py-4 align-top">
                                                        <div className="flex flex-col gap-0.5 whitespace-nowrap">
                                                            <span className="font-bold text-gray-900 text-sm">
                                                                {dayjs(dateToUse).format('MMM DD, YYYY')}
                                                            </span>
                                                            <span className="text-xs text-gray-400 font-medium">
                                                                {dayjs(dateToUse).format('HH:mm:ss')}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 align-top">
                                                        <Chip
                                                            label={log.level || log.log_type || 'INFO'}
                                                            size="small"
                                                            className={`uppercase text-[10px] font-bold tracking-wide rounded-lg border ${typeColors.bg} ${typeColors.text} ${typeColors.border}`}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 align-top">
                                                        <div className="flex flex-col gap-1.5 items-start">
                                                            <span className="text-xs font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-1 rounded inline-block w-fit whitespace-nowrap">
                                                                {log.module || log.source || 'SYSTEM'}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-1 py-0.5 rounded border border-gray-100">
                                                                {log.logType || log.source_type || 'UNKNOWN'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 align-top">
                                                        <div className="flex flex-col gap-2">
                                                            <p className="text-sm text-gray-800 font-medium leading-relaxed whitespace-pre-wrap break-words">
                                                                {log.message || "—"}
                                                            </p>
                                                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                                <details className="cursor-pointer group/details mt-1">
                                                                    <summary className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1 select-none">
                                                                        View Metadata
                                                                    </summary>
                                                                    <div className="mt-2 text-xs">
                                                                        <pre className="p-3 bg-gray-900 text-green-400 rounded-lg overflow-x-auto border border-gray-800 shadow-inner font-mono max-h-64">
                                                                            {JSON.stringify(log.metadata, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                </details>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    ) : (
                        <Box className="flex flex-col items-center justify-center h-[50vh] text-center p-8 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
                            <div className="bg-blue-50 p-4 rounded-full mb-4">
                                <FileText className="h-8 w-8 text-blue-400" />
                            </div>
                            <Typography variant="h6" className="font-bold text-gray-900 mb-1">
                                No logs found
                            </Typography>
                            <Typography variant="body2" className="text-gray-500 max-w-sm">
                                This user does not have any log records available at the moment.
                            </Typography>
                        </Box>
                    )}

                    {/* Pagination */}
                    {!loading && logs.length > 0 && totalPages > 1 && (
                        <Box className="flex flex-col xl:flex-row justify-between items-center mt-8 gap-4">
                            <div className="flex items-center gap-3">
                                <Typography variant="body2" className="text-gray-500 font-medium bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    Total: {totalCount} records
                                </Typography>
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <label htmlFor="limit-select" className="text-sm text-gray-500 font-medium mb-0">Rows per page:</label>
                                    <select
                                        id="limit-select"
                                        className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none p-0"
                                        value={limit}
                                        onChange={(e) => {
                                            setLimit(Number(e.target.value));
                                            setPage(1);
                                        }}
                                    >
                                        {[10, 20, 50, 100].map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                shape="rounded"
                                className="bg-white p-1 rounded-xl shadow-sm border border-gray-100"
                            />
                        </Box>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
}
