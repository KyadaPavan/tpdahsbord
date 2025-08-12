import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Calendar,
  Phone,
  MessageSquare,
  User,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  UserCheck,
  PlusCircle,
} from "lucide-react";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/queries`;

const STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  {
    value: "in-progress",
    label: "In Progress",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: AlertCircle,
  },
  {
    value: "completed",
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
];

const TYPE_OPTIONS = [
  {
    value: "contract",
    label: "Contract",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: FileText,
  },
  {
    value: "user",
    label: "User",
    color: "bg-pink-50 text-pink-700 border-pink-200",
    icon: User,
  },
  {
    value: "kyc",
    label: "KYC",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: Shield,
  },
  {
    value: "other",
    label: "Other",
    color: "bg-gray-50 text-gray-700 border-gray-200",
    icon: MessageSquare,
  },
];

function getColor(optionList, value) {
  return optionList.find((o) => o.value === value)?.color || "";
}

function getIcon(optionList, value) {
  return optionList.find((o) => o.value === value)?.icon || MessageSquare;
}

const QueryData = ({ dashboardUser, showToast }) => {
  const [queries, setQueries] = useState([]);
  const [allQueries, setAllQueries] = useState([]); // New state for all queries
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showQueryDetailModal, setShowQueryDetailModal] = useState(false);
  const [currentQueryId, setCurrentQueryId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: "",
    type: "contract",
    contractId: "",
    userId: "",
    attendedBy: "",
  });
  const [followUpForm, setFollowUpForm] = useState({
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [formError, setFormError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editInModal, setEditInModal] = useState(false);
  const [apiError, setApiError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter queries based on search and filters
  useEffect(() => {
    let filtered = queries;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (query) =>
          query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((query) => query.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((query) => query.status === statusFilter);
    }

    setFilteredQueries(filtered);
  }, [queries, searchTerm, typeFilter, statusFilter]);

  // Fetch all queries for status cards
  const fetchAllQueries = async () => {
    try {
      const res = await fetch(`${API_URL}`, {
        credentials: "include",
      }); // No pagination params
      const data = await res.json();
      setAllQueries(data.queries || []);
    } catch (e) {
      // Optionally handle error
    }
  };

  // Fetch queries (paginated)
  const fetchQueries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?page=${page}&limit=${limit}`, {
        credentials: "include",
      });
      const data = await res.json();
      setQueries(data.queries || []);
      setTotal(data.total || 0);
    } catch (e) {
      setApiError("Failed to fetch queries");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQueries();
    fetchAllQueries(); // Fetch all queries for status cards
    // eslint-disable-next-line
  }, [page]);

  // Handle form input
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle follow-up form input
  const handleFollowUpFormChange = (e) => {
    setFollowUpForm({ ...followUpForm, [e.target.name]: e.target.value });
  };

  // Create query
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");

    // Basic validation
    if (
      !form.name ||
      !form.phone ||
      !form.message ||
      !form.type ||
      !form.attendedBy
    ) {
      setFormError("Name, phone, message, type, and attended by are required");
      return;
    }

    // Type-specific validation
    if (form.type === "contract" && !form.contractId) {
      setFormError("Contract ID is required for contract type queries");
      return;
    }

    if (form.type === "user" && !form.userId) {
      setFormError("User ID is required for user type queries");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create query");

      setShowModal(false);
      setForm({
        name: "",
        phone: "",
        message: "",
        type: "contract",
        contractId: "",
        userId: "",
        attendedBy: "",
      });
      fetchQueries();
      showToast(`Query #${data.queryId || "new"} created successfully`);
    } catch (err) {
      setFormError(err.message);
    }
  };

  // Add follow-up
  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!followUpForm.date || !followUpForm.notes) {
      setFormError("Date and notes are required for follow-up");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${currentQueryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          newFollowUp: {
            date: new Date(followUpForm.date).toISOString(),
            notes: followUpForm.notes,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to add follow-up");

      setShowFollowUpModal(false);
      setFollowUpForm({
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setCurrentQueryId(null);
      fetchQueries();
      showToast(`Follow-up added successfully to Query #${currentQueryId}`);
    } catch (err) {
      setFormError(err.message);
    }
  };

  // Handle edit modal - opens the detailed query modal in edit mode
  const handleOpenEditModal = (query) => {
    setCurrentQueryId(query.queryId);
    setEditInModal(true);
    setEditData({
      ...editData,
      [query.queryId]: {
        name: query.name,
        phone: query.phone,
        message: query.message,
        type: query.type,
        status: query.status,
        contractId: query.contractId,
        userId: query.userId,
        attendedBy: query.attendedBy,
      },
    });
    setShowQueryDetailModal(true);
  };

  // Handle edit (inline update)
  const handleEditChange = (id, field, value) => {
    setEditData({ ...editData, [id]: { ...editData[id], [field]: value } });
  };

  const handleEditSave = async (id) => {
    const update = editData[id];
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error("Failed to update");
      setEditId(null);
      setEditData({ ...editData, [id]: {} });

      // Close modal if editing from the detailed query modal
      if (showQueryDetailModal && editInModal) {
        setEditInModal(false);
        setShowQueryDetailModal(false);
        setCurrentQueryId(null);
      }

      fetchQueries();
      showToast(`Query #${id} updated successfully`);
    } catch (err) {
      setApiError(err.message);
    }
  };

  // Delete query
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchQueries();
      showToast(`Query #${id} deleted successfully`);
    } catch (err) {
      setApiError(err.message);
    }
  };

  // Pagination controls
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen ">
      {/* Header Section */}
      <div className="py-6 border-b border-gray-100 ">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#3b158a] mb-2">
              Query Management
            </h1>
            <p className="text-gray-600">
              Manage and track customer queries efficiently
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-6 py-3 bg-[#3b158a] text-white rounded-lg hover:bg-[#4527a0] transition-colors duration-200 shadow-sm"
            onClick={() => {
              setEditInModal(false);
              setCurrentQueryId(null);
              setForm({
                name: "",
                phone: "",
                message: "",
                type: "contract",
                contractId: "",
                userId: "",
                attendedBy: "",
              });
              setShowModal(true);
            }}
            disabled={
              dashboardUser?.role !== "admin" &&
              dashboardUser?.role !== "support"
            }
          >
            Create Query
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6 ">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
          <div className="bg-gradient-to-r from-[#ede7f6] to-white p-6 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Total Queries</p>
                <p className="text-2xl font-bold text-[#3b158a]">{total}</p>
              </div>
              <div className="p-3 bg-[#3b158a] bg-opacity-10 rounded-lg">
                <MessageSquare className="text-[#3b158a]" size={24} />
              </div>
            </div>
          </div>
          <div className="p-6 border bg-gradient-to-r from-amber-50 to-white rounded-xl border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-amber-700">
                  {allQueries.filter((q) => q.status === "pending").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100">
                <Clock className="text-amber-700" size={24} />
              </div>
            </div>
          </div>
          <div className="p-6 border border-blue-100 bg-gradient-to-r from-blue-50 to-white rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-700">
                  {allQueries.filter((q) => q.status === "in-progress").length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertCircle className="text-blue-700" size={24} />
              </div>
            </div>
          </div>
          <div className="p-6 border bg-gradient-to-r from-emerald-50 to-white rounded-xl border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {allQueries.filter((q) => q.status === "completed").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100">
                <CheckCircle className="text-emerald-700" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-end p-6 rounded-xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search queries by phone number..."
                className="w-64 text-sm bg-transparent outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute transform -translate-y-1/2 pointer-events-none right-2 top-1/2">
                <Filter size={16} className="text-gray-400" />
              </div>
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute transform -translate-y-1/2 pointer-events-none right-2 top-1/2">
                <Calendar size={16} className="text-gray-400" />
              </div>
            </div>
            {(searchTerm || typeFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
                className="px-4 py-2 text-sm text-gray-600 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {apiError && (
          <div className="px-4 py-3 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
            {apiError}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto bg-white border border-gray-100 shadow-sm rounded-xl md:block">
          <table className="hidden md:table min-w-[1100px] w-full">
            <thead className="bg-[#ede7f6] border-b border-gray-100">
              <tr>
                <th className="text-center py-5 px-6 text-[#3b158a] font-semibold whitespace-nowrap">
                  ID
                </th>
                <th className="text-center py-5 px-6 text-[#3b158a] font-semibold whitespace-nowrap">
                  Name
                </th>
                <th className="text-center py-5 px-6 text-[#3b158a] font-semibold whitespace-nowrap">
                  Phone
                </th>
                <th className="text-center py-5 px-6 text-[#3b158a] font-semibold whitespace-nowrap min-w-[260px]">
                  Query
                </th>
                <th className="text-center py-5 px-6 text-[#3b158a] font-semibold whitespace-nowrap">
                  Type
                </th>
                <th className="text-center py-5 px-6 text-[#3b158a] font-semibold whitespace-nowrap">
                  ID Info
                </th>
                <th className="text-center py-5 px-6 text-[#3b158a] font-semibold whitespace-nowrap">
                  Attended By
                </th>
                <th className="text-center py-5 px-6 text-[#3b158a] font-semibold whitespace-nowrap">
                  Status
                </th>
                <th className="text-center py-5 px-6 text-[#3b158a] font-semibold whitespace-nowrap">
                  Follow-ups
                </th>
                <th className="text-center py-5 px-6 text-[#3b158a] font-semibold whitespace-nowrap">
                  Created
                </th>
                <th className="text-center py-5 px-6 text-[#3b158a] font-semibold whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b158a]"></div>
                      <span className="ml-3 text-gray-600">
                        Loading queries...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredQueries.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center">
                    <div className="flex flex-col items-center">
                      <MessageSquare size={48} className="mb-4 text-gray-300" />
                      <p className="text-lg text-gray-600">
                        {searchTerm ||
                        typeFilter !== "all" ||
                        statusFilter !== "all"
                          ? "No queries match your filters"
                          : "No queries found"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {searchTerm ||
                        typeFilter !== "all" ||
                        statusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Create your first query to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQueries.map((q, index) => (
                  <tr
                    key={q.queryId}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-25"
                    }`}
                    style={{ height: "70px" }}
                    onClick={() => {
                      setCurrentQueryId(q.queryId);
                      setShowQueryDetailModal(true);
                    }}
                  >
                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                      <span className="font-mono text-sm bg-[#ede7f6] px-2 py-1 rounded text-[#3b158a]">
                        {q.queryId}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {q.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-gray-700">{q.phone}</span>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 align-middle min-w-[260px] max-w-[260px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {editId === q.queryId ? (
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                          value={editData[q.queryId]?.message ?? q.message}
                          onChange={(e) =>
                            handleEditChange(
                              q.queryId,
                              "message",
                              e.target.value
                            )
                          }
                          rows="4"
                        />
                      ) : (
                        <div className="w-full p-1 text-left rounded">
                          <p className="text-gray-700 line-clamp-3 max-h-[4.5em] overflow-hidden">
                            {q.message}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                      {editId === q.queryId ? (
                        <select
                          className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent ${getColor(
                            TYPE_OPTIONS,
                            editData[q.queryId]?.type ?? q.type
                          )}`}
                          value={editData[q.queryId]?.type ?? q.type}
                          onChange={(e) =>
                            handleEditChange(q.queryId, "type", e.target.value)
                          }
                        >
                          {TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getColor(
                            TYPE_OPTIONS,
                            q.type
                          )} whitespace-nowrap`}
                        >
                          {React.createElement(getIcon(TYPE_OPTIONS, q.type), {
                            size: 14,
                          })}
                          {q.type}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                      {editId === q.queryId ? (
                        q.type === "contract" ? (
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                            value={
                              editData[q.queryId]?.contractId ??
                              q.contractId ??
                              ""
                            }
                            onChange={(e) =>
                              handleEditChange(
                                q.queryId,
                                "contractId",
                                e.target.value
                              )
                            }
                            placeholder="Contract ID"
                          />
                        ) : q.type === "user" ? (
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                            value={
                              editData[q.queryId]?.userId ?? q.userId ?? ""
                            }
                            onChange={(e) =>
                              handleEditChange(
                                q.queryId,
                                "userId",
                                e.target.value
                              )
                            }
                            placeholder="User ID"
                          />
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )
                      ) : (
                        <div>
                          {q.type === "contract" && q.contractId ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-purple-700 rounded bg-purple-50">
                              <FileSignature size={12} />
                              {q.contractId}
                            </span>
                          ) : q.type === "user" && q.userId ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-pink-700 rounded bg-pink-50">
                              <User size={12} />
                              {q.userId}
                            </span>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                      {editId === q.queryId ? (
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                          value={
                            editData[q.queryId]?.attendedBy ??
                            q.attendedBy ??
                            ""
                          }
                          onChange={(e) =>
                            handleEditChange(
                              q.queryId,
                              "attendedBy",
                              e.target.value
                            )
                          }
                          placeholder="Attended By"
                        />
                      ) : (
                        <div className="flex items-center gap-1">
                          <UserCheck size={14} className="text-gray-400" />
                          <span className="text-gray-700">
                            {q.attendedBy || q.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                      {editId === q.queryId ? (
                        <select
                          className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent ${getColor(
                            STATUS_OPTIONS,
                            editData[q.queryId]?.status ?? q.status
                          )}`}
                          value={editData[q.queryId]?.status ?? q.status}
                          onChange={(e) =>
                            handleEditChange(
                              q.queryId,
                              "status",
                              e.target.value
                            )
                          }
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getColor(
                            STATUS_OPTIONS,
                            q.status
                          )} whitespace-nowrap`}
                        >
                          {React.createElement(
                            getIcon(STATUS_OPTIONS, q.status),
                            { size: 14 }
                          )}
                          {q.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {q.followUps && q.followUps.length > 0 ? (
                          <button
                            className="inline-flex items-center gap-1 px-2 py-1 text-blue-700 rounded cursor-pointer bg-blue-50"
                            onClick={() => {
                              setCurrentQueryId(q.queryId);
                              setShowFollowUpModal(true);
                            }}
                          >
                            <Calendar size={14} />
                            {q.followUps.length} Follow-up
                            {q.followUps.length > 1 ? "s" : ""}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">
                            No follow-ups
                          </span>
                        )}
                        {(dashboardUser?.role === "admin" ||
                          dashboardUser?.role === "support") && (
                          <button
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#3b158a] hover:bg-[#ede7f6] rounded transition-colors"
                            onClick={() => {
                              setCurrentQueryId(q.queryId);
                              setShowFollowUpModal(true);
                            }}
                          >
                            <PlusCircle size={12} />
                            Add Follow-up
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 align-middle whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        {editId === q.queryId ? (
                          <>
                            <button
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                              onClick={() => handleEditSave(q.queryId)}
                              disabled={
                                dashboardUser?.role !== "admin" &&
                                dashboardUser?.role !== "support"
                              }
                            >
                              <Save size={14} />
                              Save
                            </button>
                            <button
                              className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                              onClick={() => setEditId(null)}
                            >
                              <X size={14} />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#3b158a] text-white rounded-lg hover:bg-[#4527a0] transition-colors text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(q);
                            }}
                            disabled={
                              dashboardUser?.role !== "admin" &&
                              dashboardUser?.role !== "support"
                            }
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                        )}
                        {dashboardUser?.role === "admin" && (
                          <button
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(q.queryId);
                            }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile view */}
          <div className="block md:hidden">
            {filteredQueries.map((q) => (
              <div
                key={q.queryId}
                className="p-4 mb-4 bg-white border border-gray-100 rounded-lg shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm bg-[#ede7f6] px-2 py-1 rounded text-[#3b158a]">
                    {q.queryId}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getColor(
                      STATUS_OPTIONS,
                      q.status
                    )} whitespace-nowrap`}
                  >
                    {React.createElement(getIcon(STATUS_OPTIONS, q.status), {
                      size: 14,
                    })}
                    {q.status}
                  </span>
                </div>
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Name:</p>
                  <p className="font-medium text-gray-900">{q.name}</p>
                </div>
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Phone:</p>
                  <p className="font-medium text-gray-900">{q.phone}</p>
                </div>
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Message:</p>
                  <p className="font-medium text-gray-900">{q.message}</p>
                </div>
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Type:</p>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getColor(
                      TYPE_OPTIONS,
                      q.type
                    )} whitespace-nowrap`}
                  >
                    {React.createElement(getIcon(TYPE_OPTIONS, q.type), {
                      size: 14,
                    })}
                    {q.type}
                  </span>
                </div>
                {q.type === "contract" && q.contractId && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">Contract ID:</p>
                    <p className="font-medium text-gray-900">{q.contractId}</p>
                  </div>
                )}
                {q.type === "user" && q.userId && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">User ID:</p>
                    <p className="font-medium text-gray-900">{q.userId}</p>
                  </div>
                )}
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Attended By:</p>
                  <p className="font-medium text-gray-900">
                    {q.attendedBy || q.name}
                  </p>
                </div>
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Follow-ups:</p>
                  {q.followUps && q.followUps.length > 0 ? (
                    <div className="mt-1">
                      {q.followUps.map((followUp, idx) => (
                        <div
                          key={idx}
                          className="pb-2 mb-2 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0"
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar size={12} className="text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {new Date(followUp.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{followUp.notes}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No follow-ups</p>
                  )}
                  {(dashboardUser?.role === "admin" ||
                    dashboardUser?.role === "support") && (
                    <button
                      className="inline-flex items-center gap-1 px-2 py-1 mt-1 text-xs text-[#3b158a] bg-[#ede7f6] rounded transition-colors"
                      onClick={() => {
                        setCurrentQueryId(q.queryId);
                        setShowFollowUpModal(true);
                      }}
                    >
                      <PlusCircle size={12} />
                      Add Follow-up
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#3b158a] text-white rounded-lg hover:bg-[#4527a0] transition-colors text-sm"
                    onClick={() => {
                      handleOpenEditModal(q);
                    }}
                    disabled={
                      dashboardUser?.role !== "admin" &&
                      dashboardUser?.role !== "support"
                    }
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  {dashboardUser?.role === "admin" && (
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      onClick={() => handleDelete(q.queryId)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-600">
            {(() => {
              const start =
                filteredQueries.length > 0 ? (page - 1) * limit + 1 : 0;
              const end =
                filteredQueries.length > 0 ? Math.min(page * limit, total) : 0;
              return `Showing ${start} to ${end} of ${total} entries`;
            })()}
            {(searchTerm || typeFilter !== "all" || statusFilter !== "all") && (
              <span className="ml-2 text-[#3b158a]">
                (filtered from {total} total)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1 px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors mr-1 ${
                      page === pageNum
                        ? "bg-[#3b158a] text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              className="flex items-center gap-1 px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Create Query Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-[#3b158a]">
                Create New Query
              </h3>
              <button
                className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                onClick={() => {
                  setShowModal(false);
                  setForm({
                    name: "",
                    phone: "",
                    message: "",
                    type: "contract",
                    contractId: "",
                    userId: "",
                    attendedBy: "",
                  });
                }}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="px-4 py-3 text-red-700 border border-red-200 rounded-lg bg-red-50">
                  {formError}
                </div>
              )}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <User size={16} className="inline mr-2" />
                  Name
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <Phone size={16} className="inline mr-2" />
                  Phone
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <MessageSquare size={16} className="inline mr-2" />
                  Message
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent resize-none"
                  name="message"
                  value={form.message}
                  onChange={handleFormChange}
                  placeholder="Enter your message or query"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <Filter size={16} className="inline mr-2" />
                  Type
                </label>
                <select
                  className="appearance-none w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent bg-white"
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  required
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditional fields based on type */}
              {form.type === "contract" && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <FileSignature size={16} className="inline mr-2" />
                    Contract ID
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                    name="contractId"
                    value={form.contractId}
                    onChange={handleFormChange}
                    placeholder="Enter contract ID"
                    required
                  />
                </div>
              )}

              {form.type === "user" && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <User size={16} className="inline mr-2" />
                    User ID
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                    name="userId"
                    value={form.userId}
                    onChange={handleFormChange}
                    placeholder="Enter user ID"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <UserCheck size={16} className="inline mr-2" />
                  Attended By
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                  name="attendedBy"
                  value={form.attendedBy}
                  onChange={handleFormChange}
                  placeholder="Enter name of person attending to this query"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 px-6 py-3 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => {
                    setShowModal(false);
                    setForm({
                      name: "",
                      phone: "",
                      message: "",
                      type: "contract",
                      contractId: "",
                      userId: "",
                      attendedBy: "",
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 px-6 py-3 bg-[#3b158a] text-white rounded-lg hover:bg-[#4527a0] transition-colors font-medium"
                  onClick={handleCreate}
                >
                  Create Query
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Query Detail Modal */}
      {showQueryDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-[#3b158a]">
                Query Details
              </h3>
              <button
                className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                onClick={() => setShowQueryDetailModal(false)}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            {currentQueryId && (
              <div className="p-6">
                {queries.find((q) => q.queryId === currentQueryId) && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm bg-[#ede7f6] px-2 py-1 rounded text-[#3b158a]">
                        {currentQueryId}
                      </span>
                      {!editInModal ? (
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getColor(
                            STATUS_OPTIONS,
                            queries.find((q) => q.queryId === currentQueryId)
                              ?.status
                          )} whitespace-nowrap`}
                        >
                          {React.createElement(
                            getIcon(
                              STATUS_OPTIONS,
                              queries.find((q) => q.queryId === currentQueryId)
                                ?.status
                            ),
                            { size: 14 }
                          )}
                          {
                            queries.find((q) => q.queryId === currentQueryId)
                              ?.status
                          }
                        </span>
                      ) : (
                        <select
                          className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent ${getColor(
                            STATUS_OPTIONS,
                            editData[currentQueryId]?.status ??
                              queries.find((q) => q.queryId === currentQueryId)
                                ?.status
                          )}`}
                          value={
                            editData[currentQueryId]?.status ??
                            queries.find((q) => q.queryId === currentQueryId)
                              ?.status
                          }
                          onChange={(e) =>
                            handleEditChange(
                              currentQueryId,
                              "status",
                              e.target.value
                            )
                          }
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-1 text-sm font-medium text-gray-500">
                          Name
                        </h4>
                        {!editInModal ? (
                          <p className="text-lg font-medium">
                            {
                              queries.find((q) => q.queryId === currentQueryId)
                                ?.name
                            }
                          </p>
                        ) : (
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                            value={
                              editData[currentQueryId]?.name ??
                              queries.find((q) => q.queryId === currentQueryId)
                                ?.name
                            }
                            onChange={(e) =>
                              handleEditChange(
                                currentQueryId,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-medium text-gray-500">
                          Phone
                        </h4>
                        {!editInModal ? (
                          <p className="text-lg font-medium">
                            {
                              queries.find((q) => q.queryId === currentQueryId)
                                ?.phone
                            }
                          </p>
                        ) : (
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                            value={
                              editData[currentQueryId]?.phone ??
                              queries.find((q) => q.queryId === currentQueryId)
                                ?.phone
                            }
                            onChange={(e) =>
                              handleEditChange(
                                currentQueryId,
                                "phone",
                                e.target.value
                              )
                            }
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-medium text-gray-500">
                          Type
                        </h4>
                        {!editInModal ? (
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getColor(
                              TYPE_OPTIONS,
                              queries.find((q) => q.queryId === currentQueryId)
                                ?.type
                            )} whitespace-nowrap`}
                          >
                            {React.createElement(
                              getIcon(
                                TYPE_OPTIONS,
                                queries.find(
                                  (q) => q.queryId === currentQueryId
                                )?.type
                              ),
                              {
                                size: 14,
                              }
                            )}
                            {
                              queries.find((q) => q.queryId === currentQueryId)
                                ?.type
                            }
                          </span>
                        ) : (
                          <select
                            className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent ${getColor(
                              TYPE_OPTIONS,
                              editData[currentQueryId]?.type ??
                                queries.find(
                                  (q) => q.queryId === currentQueryId
                                )?.type
                            )}`}
                            value={
                              editData[currentQueryId]?.type ??
                              queries.find((q) => q.queryId === currentQueryId)
                                ?.type
                            }
                            onChange={(e) =>
                              handleEditChange(
                                currentQueryId,
                                "type",
                                e.target.value
                              )
                            }
                          >
                            {TYPE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-medium text-gray-500">
                          Created
                        </h4>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar size={14} />
                          {new Date(
                            queries.find(
                              (q) => q.queryId === currentQueryId
                            )?.createdAt
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      {(queries.find((q) => q.queryId === currentQueryId)
                        ?.type === "contract" ||
                        editData[currentQueryId]?.type === "contract") && (
                        <div>
                          <h4 className="mb-1 text-sm font-medium text-gray-500">
                            Contract ID
                          </h4>
                          {!editInModal ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-purple-700 rounded bg-purple-50">
                              <FileSignature size={12} />
                              {
                                queries.find(
                                  (q) => q.queryId === currentQueryId
                                )?.contractId
                              }
                            </span>
                          ) : (
                            <input
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                              value={
                                editData[currentQueryId]?.contractId ??
                                queries.find(
                                  (q) => q.queryId === currentQueryId
                                )?.contractId ??
                                ""
                              }
                              onChange={(e) =>
                                handleEditChange(
                                  currentQueryId,
                                  "contractId",
                                  e.target.value
                                )
                              }
                              placeholder="Contract ID"
                            />
                          )}
                        </div>
                      )}
                      {(queries.find((q) => q.queryId === currentQueryId)
                        ?.type === "user" ||
                        editData[currentQueryId]?.type === "user") && (
                        <div>
                          <h4 className="mb-1 text-sm font-medium text-gray-500">
                            User ID
                          </h4>
                          {!editInModal ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-pink-700 rounded bg-pink-50">
                              <User size={12} />
                              {
                                queries.find(
                                  (q) => q.queryId === currentQueryId
                                )?.userId
                              }
                            </span>
                          ) : (
                            <input
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                              value={
                                editData[currentQueryId]?.userId ??
                                queries.find(
                                  (q) => q.queryId === currentQueryId
                                )?.userId ??
                                ""
                              }
                              onChange={(e) =>
                                handleEditChange(
                                  currentQueryId,
                                  "userId",
                                  e.target.value
                                )
                              }
                              placeholder="User ID"
                            />
                          )}
                        </div>
                      )}
                      <div>
                        <h4 className="mb-1 text-sm font-medium text-gray-500">
                          Attended By
                        </h4>
                        {!editInModal ? (
                          <div className="flex items-center gap-1">
                            <UserCheck size={14} className="text-gray-500" />
                            <span className="text-gray-700">
                              {queries.find((q) => q.queryId === currentQueryId)
                                ?.attendedBy ||
                                queries.find(
                                  (q) => q.queryId === currentQueryId
                                )?.name}
                            </span>
                          </div>
                        ) : (
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                            value={
                              editData[currentQueryId]?.attendedBy ??
                              queries.find((q) => q.queryId === currentQueryId)
                                ?.attendedBy ??
                              ""
                            }
                            onChange={(e) =>
                              handleEditChange(
                                currentQueryId,
                                "attendedBy",
                                e.target.value
                              )
                            }
                            placeholder="Attended By"
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-medium text-gray-500">
                        Message
                      </h4>
                      {!editInModal ? (
                        <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                          <p className="whitespace-pre-line">
                            {
                              queries.find((q) => q.queryId === currentQueryId)
                                ?.message
                            }
                          </p>
                        </div>
                      ) : (
                        <textarea
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent resize-none"
                          value={
                            editData[currentQueryId]?.message ??
                            queries.find((q) => q.queryId === currentQueryId)
                              ?.message
                          }
                          onChange={(e) =>
                            handleEditChange(
                              currentQueryId,
                              "message",
                              e.target.value
                            )
                          }
                          rows="4"
                        />
                      )}
                    </div>

                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-medium text-gray-500">
                        Follow-ups
                      </h4>
                      {queries.find((q) => q.queryId === currentQueryId)
                        ?.followUps?.length > 0 ? (
                        <div className="space-y-3">
                          {queries
                            .find((q) => q.queryId === currentQueryId)
                            ?.followUps.map((followUp, idx) => (
                              <div
                                key={idx}
                                className="p-3 border border-gray-100 rounded-lg bg-gray-50"
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <Calendar
                                    size={12}
                                    className="text-gray-500"
                                  />
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      followUp.date
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-800">
                                  {followUp.notes}
                                </p>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No follow-ups</p>
                      )}
                      {(dashboardUser?.role === "admin" ||
                        dashboardUser?.role === "support") && (
                        <button
                          className="inline-flex items-center gap-1 px-3 py-2 mt-3 text-sm text-[#3b158a] bg-[#ede7f6] rounded-lg transition-colors hover:bg-[#d1c4e9]"
                          onClick={() => {
                            setShowQueryDetailModal(false);
                            setShowFollowUpModal(true);
                          }}
                        >
                          <PlusCircle size={16} />
                          Add Follow-up
                        </button>
                      )}
                    </div>

                    <div className="flex justify-between pt-6 mt-6 border-t border-gray-100">
                      {!editInModal ? (
                        <button
                          type="button"
                          className="px-6 py-3 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                          onClick={() => setShowQueryDetailModal(false)}
                        >
                          Close
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="px-6 py-3 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                          onClick={() => {
                            setEditInModal(false);
                            setEditData({ ...editData, [currentQueryId]: {} });
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      <div className="flex gap-3">
                        {!editInModal &&
                          (dashboardUser?.role === "admin" ||
                            dashboardUser?.role === "support") && (
                            <button
                              className="flex items-center gap-1 px-4 py-3 bg-[#3b158a] text-white rounded-lg hover:bg-[#4527a0] transition-colors"
                              onClick={() => {
                                setEditInModal(true);
                                setEditData({
                                  ...editData,
                                  [currentQueryId]: {
                                    name: queries.find(
                                      (q) => q.queryId === currentQueryId
                                    )?.name,
                                    phone: queries.find(
                                      (q) => q.queryId === currentQueryId
                                    )?.phone,
                                    message: queries.find(
                                      (q) => q.queryId === currentQueryId
                                    )?.message,
                                    type: queries.find(
                                      (q) => q.queryId === currentQueryId
                                    )?.type,
                                    status: queries.find(
                                      (q) => q.queryId === currentQueryId
                                    )?.status,
                                    contractId: queries.find(
                                      (q) => q.queryId === currentQueryId
                                    )?.contractId,
                                    userId: queries.find(
                                      (q) => q.queryId === currentQueryId
                                    )?.userId,
                                    attendedBy: queries.find(
                                      (q) => q.queryId === currentQueryId
                                    )?.attendedBy,
                                  },
                                });
                              }}
                            >
                              <Edit3 size={16} />
                              Edit Query
                            </button>
                          )}
                        {editInModal && (
                          <button
                            className="flex items-center gap-1 px-4 py-3 text-white transition-colors rounded-lg bg-emerald-500 hover:bg-emerald-600"
                            onClick={() => {
                              handleEditSave(currentQueryId);
                            }}
                          >
                            <Save size={16} />
                            Save Changes
                          </button>
                        )}
                        {dashboardUser?.role === "admin" && (
                          <button
                            className="flex items-center gap-1 px-4 py-3 text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
                            onClick={() => {
                              handleDelete(currentQueryId);
                              setShowQueryDetailModal(false);
                              showToast(
                                `Query #${currentQueryId} deleted successfully`
                              );
                            }}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Follow-up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-[#3b158a]">
                {currentQueryId &&
                queries.find((q) => q.queryId === currentQueryId)?.followUps
                  ?.length > 0
                  ? "Follow-ups"
                  : "Add Follow-up"}
              </h3>
              <button
                className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                onClick={() => setShowFollowUpModal(false)}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Display existing follow-ups if any */}
              {currentQueryId &&
                queries.find((q) => q.queryId === currentQueryId)?.followUps
                  ?.length > 0 && (
                  <div className="pb-6 border-b border-gray-200">
                    <h4 className="font-semibold mb-4 text-[#3b158a] text-lg">
                      Existing Follow-ups
                    </h4>
                    <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
                      {queries
                        .find((q) => q.queryId === currentQueryId)
                        ?.followUps.map((followUp, idx) => (
                          <div
                            key={idx}
                            className="p-3 border border-gray-100 rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center gap-1 mb-2">
                              <Calendar size={14} className="text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">
                                {new Date(followUp.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-800">{followUp.notes}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              {formError && (
                <div className="px-4 py-3 text-red-700 border border-red-200 rounded-lg bg-red-50">
                  {formError}
                </div>
              )}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <Calendar size={16} className="inline mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent"
                  name="date"
                  value={followUpForm.date}
                  onChange={handleFollowUpFormChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <MessageSquare size={16} className="inline mr-2" />
                  Notes
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b158a] focus:border-transparent resize-none"
                  name="notes"
                  value={followUpForm.notes}
                  onChange={handleFollowUpFormChange}
                  placeholder="Enter a new follow up"
                  rows="3"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 px-6 py-3 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => setShowFollowUpModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 px-6 py-3 bg-[#3b158a] text-white rounded-lg hover:bg-[#4527a0] transition-colors font-medium"
                  onClick={handleAddFollowUp}
                >
                  Add Follow-up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryData;
