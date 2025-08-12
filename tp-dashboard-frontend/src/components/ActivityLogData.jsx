import React, { useState, useEffect } from "react";
import {
  Clock,
  User,
  FileText,
  Settings,
  Shield,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Eye,
  Edit3,
  Trash2,
  Plus,
  LogIn,
  LogOut,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  GitCommit,
  ArrowRight,
} from "lucide-react";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/activity-logs`;

// Action icons mapping
const ACTION_ICONS = {
  CREATE: Plus,
  UPDATE: Edit3,
  DELETE: Trash2,
  LOGIN: LogIn,
  LOGOUT: LogOut,
};

// Action colors mapping
const ACTION_COLORS = {
  CREATE: "bg-green-50 text-green-700 border-green-200",
  UPDATE: "bg-blue-50 text-blue-700 border-blue-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
  LOGIN: "bg-purple-50 text-purple-700 border-purple-200",
  LOGOUT: "bg-gray-50 text-gray-700 border-gray-200",
};

// Resource icons mapping
const RESOURCE_ICONS = {
  USER: User,
  CONTRACT: FileText,
  QUERY: AlertCircle,
  ADMIN_PAYOUT: Settings,
  AUTH: Shield,
  DASHBOARD_USER: User,
};

// Resource colors mapping
const RESOURCE_COLORS = {
  USER: "bg-indigo-100 text-indigo-700",
  CONTRACT: "bg-orange-100 text-orange-700",
  QUERY: "bg-yellow-100 text-yellow-700",
  ADMIN_PAYOUT: "bg-pink-100 text-pink-700",
  AUTH: "bg-emerald-100 text-emerald-700",
  DASHBOARD_USER: "bg-cyan-100 text-cyan-700",
};

const ActivityLogData = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10,
  });

  // Filters
  const [filters, setFilters] = useState({
    action: "",
    resource: "",
    search: "",
    startDate: "",
    endDate: "",
    userId: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Fetch activity logs
  const fetchLogs = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.action && { action: filters.action }),
        ...(filters.resource && { resource: filters.resource }),
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.userId && { userId: filters.userId }),
      });

      const response = await fetch(`${API_URL}?${queryParams}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch activity logs");
      }

      const data = await response.json();

      if (data.success) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message || "Failed to fetch logs");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch activity statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats?days=30`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLogs(1);
    fetchStats();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchLogs(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      action: "",
      resource: "",
      search: "",
      startDate: "",
      endDate: "",
      userId: "",
    });
    setTimeout(() => fetchLogs(1), 100);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLogs(newPage);
    }
  };

  // Format action description
  const formatActionDescription = (log) => {
    const { action, resource, resourceId, performedBy, targetUser, metadata } =
      log;

    switch (action) {
      case "CREATE":
        if (resource === "USER")
          return `Created user ${targetUser?.email || resourceId}`;
        if (resource === "CONTRACT") return `Created contract ${resourceId}`;
        if (resource === "QUERY") return `Created query ${resourceId}`;
        return `Created ${resource.toLowerCase()} ${resourceId}`;

      case "UPDATE":
        if (resource === "USER")
          return `Updated user ${targetUser?.email || resourceId}`;
        if (resource === "CONTRACT") return `Updated contract ${resourceId}`;
        if (resource === "QUERY") return `Updated query ${resourceId}`;
        return `Updated ${resource.toLowerCase()} ${resourceId}`;

      case "DELETE":
        if (resource === "USER")
          return `Deleted user ${targetUser?.email || resourceId}`;
        if (resource === "CONTRACT") return `Deleted contract ${resourceId}`;
        if (resource === "QUERY") return `Deleted query ${resourceId}`;
        return `Deleted ${resource.toLowerCase()} ${resourceId}`;

      case "LOGIN":
        return `Logged into dashboard`;

      case "LOGOUT":
        return `Logged out from dashboard`;

      default:
        return metadata?.description || `${action} ${resource}`;
    }
  };

  // Toggle row expansion
  const toggleRowExpansion = (logId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(logId)) {
      newExpandedRows.delete(logId);
    } else {
      newExpandedRows.add(logId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Format field value for display
  const formatFieldValue = (value) => {
    if (value === null || value === undefined) {
      return <span className="italic text-gray-400">null</span>;
    }
    if (typeof value === "boolean") {
      return value ? (
        <span className="font-medium text-green-600">true</span>
      ) : (
        <span className="font-medium text-red-600">false</span>
      );
    }
    if (typeof value === "object") {
      return (
        <pre className="max-w-xs p-2 overflow-auto text-xs rounded bg-gray-50">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    if (typeof value === "string" && value.length > 50) {
      return (
        <span className="text-sm" title={value}>
          {value.substring(0, 47)}...
        </span>
      );
    }
    return <span className="text-sm">{String(value)}</span>;
  };

  // Check if log has meaningful changes to show
  const hasChangesToShow = (log) => {
    if (log.action === "LOGIN" || log.action === "LOGOUT") return false;
    return (
      log.changes &&
      log.changes.fieldsChanged &&
      log.changes.fieldsChanged.length > 0
    );
  };

  // Render changes details
  const renderChanges = (log) => {
    if (!hasChangesToShow(log)) {
      return (
        <div className="text-sm italic text-gray-500">
          No detailed changes available for this action
        </div>
      );
    }

    const { before, after, fieldsChanged } = log.changes;

    return (
      <div className="space-y-3 ">
        <h4 className="flex items-center gap-2 font-semibold text-[#3b158a]">
          Changes Made ({fieldsChanged.length} field
          {fieldsChanged.length !== 1 ? "s" : ""})
        </h4>

        <div className="space-y-2">
          {fieldsChanged.map((field, index) => (
            <div
              key={index}
              className="p-3 border-l-4 border-[#3b158a] rounded-lg bg-gray-50"
            >
              <div className="mb-2 font-medium text-gray-900">
                <code className="px-2 py-1 text-sm bg-[#3b158a] rounded text-white">
                  {field}
                </code>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* Before */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium tracking-wide text-red-700 uppercase">
                      Before
                    </span>
                  </div>
                  <div className="p-2 border rounded bg-red-50">
                    {formatFieldValue(before?.[field])}
                  </div>
                </div>

                {/* After */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium tracking-wide text-green-700 uppercase">
                      After
                    </span>
                  </div>
                  <div className="p-2 border rounded bg-green-50">
                    {formatFieldValue(after?.[field])}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-10 space-y-6 bg-gray-100/80">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className=" gap-3 text-3xl font-bold text-[#3b158a]">
            Activity Log
          </h1>
          <p className="mt-1 text-gray-600">
            Track all administrative activities and changes
          </p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => fetchLogs(pagination.currentPage)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#3b158a] text-white rounded-lg hover:bg-[#2d0f6b] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#3b158a]"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 py-6 md:grid-cols-2 lg:grid-cols-4">
          <div className=" bg-white   bg-gradient-to-r from-[#ede7f6] to-white p-6 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-gray-600">
                  Total Activities
                </p>
                <p className="text-2xl font-bold text-[#3b158a]">
                  {stats.actionStats.reduce((sum, stat) => sum + stat.count, 0)}
                </p>
              </div>

              <div className="p-3 bg-[#3b158a] bg-opacity-10 rounded-lg">
                <TrendingUp className="text-[#3b158a]" size={24} />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border bg-gradient-to-r from-amber-50 to-white rounded-xl border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-gray-600">
                  Most Active Resource
                </p>
                <p className="text-2xl font-bold text-amber-700">
                  {stats.resourceStats[0]?.["_id"] || "N/A"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-amber-100">
                <Shield className="text-amber-700" size={24} />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-blue-100 bg-gradient-to-r from-blue-50 to-white rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-gray-600">
                  Most Common Action
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {stats.actionStats[0]?.["_id"] || "N/A"}
                </p>
              </div>

              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="text-blue-700" size={24} />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border bg-gradient-to-r from-emerald-50 to-white rounded-xl border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-gray-600">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-emerald-700">
                  {stats.userStats?.length || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100">
                <User className="text-emerald-700" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-6 bg-white border shadow-sm rounded-xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Resource
              </label>
              <select
                value={filters.resource}
                onChange={(e) => handleFilterChange("resource", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
              >
                <option value="">All Resources</option>
                <option value="USER">User</option>
                <option value="CONTRACT">Contract</option>
                <option value="QUERY">Query</option>
                <option value="ADMIN_PAYOUT">Admin Payout</option>
                <option value="AUTH">Authentication</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 bg-[#3b158a] text-white rounded-lg px-4 py-2 hover:bg-[#2d0f6b] transition-colors"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#3b158a]"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Activity Logs Table */}
      <div className="overflow-hidden bg-white border shadow-sm rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b  bg-[#ede7f6]">
              <tr>
                <th className="px-6 py-4 font-semibold text-center text-[#3b158a]">
                  Action
                </th>
                <th className="px-6 py-4 font-semibold text-center text-[#3b158a]">
                  Resource
                </th>
                <th className="px-6 py-4 font-semibold text-center text-[#3b158a]">
                  Description
                </th>
                <th className="px-6 py-4 font-semibold text-center text-[#3b158a]">
                  Performed By
                </th>
                <th className="px-6 py-4 font-semibold text-center text-[#3b158a]">
                  Timestamp
                </th>
                <th className="px-6 py-4 font-semibold text-center text-[#3b158a]">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
                    <p className="text-gray-500">Loading activity logs...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No activity logs found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const ActionIcon = ACTION_ICONS[log.action] || Activity;
                  const ResourceIcon = RESOURCE_ICONS[log.resource] || FileText;
                  const isExpanded = expandedRows.has(log._id);
                  const canExpand = hasChangesToShow(log);

                  return (
                    <React.Fragment key={log._id}>
                      <tr className="transition-colors border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg border ${
                                ACTION_COLORS[log.action] ||
                                "bg-gray-50 text-gray-700 border-gray-200"
                              }`}
                            >
                              <ActionIcon className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-gray-900">
                              {log.action}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg border ${
                                RESOURCE_COLORS[log.resource] ||
                                "bg-gray-100 text-gray-700"
                              }`}
                            >
                              <ResourceIcon className="w-4 h-4" />
                            </div>
                            <span className="text-gray-700">
                              {log.resource}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-gray-900">
                            {formatActionDescription(log)}
                          </p>
                          {log.metadata?.description && (
                            <p className="mt-1 text-sm text-gray-500">
                              {log.metadata.description}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#3b158a] rounded-full flex items-center justify-center">
                              <span className="text-base font-medium text-white">
                                {log.performedBy.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {log.performedBy.email}
                              </p>
                              <p className="text-sm text-gray-500 capitalize">
                                {log.performedBy.role}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-6 h-6 text-gray-400" />
                            <span className="text-gray-700">
                              {log.timestamp}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          {canExpand ? (
                            <button
                              onClick={() => toggleRowExpansion(log._id)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-base text-[#3b158a] transition-colors border border-blue-200 rounded-lg hover:bg-blue-50"
                            >
                              {isExpanded ? (
                                <>
                                  Hide
                                  <ChevronUp className="w-4 h-4" />
                                </>
                              ) : (
                                <>
                                  Changes
                                  <ChevronDown className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded row showing changes */}
                      {isExpanded && canExpand && (
                        <tr className="bg-gray-50">
                          <td colSpan="6" className="px-6 py-4">
                            <div className="max-w-4xl mx-auto">
                              {renderChanges(log)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            <div className="text-sm text-gray-700">
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalLogs
              )}{" "}
              of {pagination.totalLogs} results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="flex items-center gap-2 px-3 py-2 transition-colors border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:text-[#3b158a]"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          page === pagination.currentPage
                            ? "bg-[#3b158a] text-white"
                            : "border border-gray-300 hover:bg-gray-50 hover:text-[#3b158a]"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="flex items-center gap-2 px-3 py-2 transition-colors border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:text-[#3b158a]"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogData;
