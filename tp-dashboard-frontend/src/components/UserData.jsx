import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";

const badge = (label, color) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
    {label}
  </span>
);

export default function UserData({ user: initialUser, canUpdate, showToast }) {
  const { authenticatedFetch } = useAuth();
  const [user, setUser] = useState(initialUser);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    username: initialUser.username || "",
    email: initialUser.email || "",
    phone: initialUser.phone || "",
    aadhar_number:
      initialUser.user_confidential_data?.aadhar_card_data?.card_number || "",
    aadhar_name:
      initialUser.user_confidential_data?.aadhar_card_data?.card_holder_name ||
      "",
    pan_number:
      initialUser.user_confidential_data?.pan_card_data?.card_number || "",
    pan_name:
      initialUser.user_confidential_data?.pan_card_data?.card_holder_name || "",
    bank_account_number:
      initialUser.user_confidential_data?.bank_data?.[0]?.bank_account_number ||
      "",
    bank_ifsc_number:
      initialUser.user_confidential_data?.bank_data?.[0]?.bank_ifsc_number ||
      "",
    pan_verification: initialUser.kyc_verified?.pan_card_verification || false,
    aadhar_verification:
      initialUser.kyc_verified?.aadhar_card_verification || false,
  });
  // Removed showPanForm and showAadharForm states as they're no longer needed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [contractsExpanded, setContractsExpanded] = useState(false);
  const [expandedContract, setExpandedContract] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    setUser(initialUser);
    if (initialUser?.user_id) {
      fetchUserDetails(initialUser.user_id);
    }
  }, [initialUser]);

  const fetchUserDetails = async (userId) => {
    setLoadingDetails(true);
    try {
      const res = await authenticatedFetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/${userId}`
      );
      if (!res.ok) throw new Error("Failed to fetch user details");
      const data = await res.json();
      setUserDetails(data);
    } catch (err) {
      console.error("Error fetching user details:", err);
      // If it's a session expiration, the TokenExpirationHandler will handle it
      if (err.message !== "Session expired") {
        // Handle other types of errors
        if (typeof showToast === "function") {
          showToast("Failed to fetch user details", "error");
        }
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const kyc = user.kyc_verified || {};
  const panStatus = kyc.pan_card_verification ? "Verified" : "Pending";
  const aadharStatus = kyc.aadhar_card_verification ? "Verified" : "Pending";
  const panColor = kyc.pan_card_verification
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700";
  const aadharColor = kyc.aadhar_card_verification
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let phone = form.phone.toString();
    if (!phone.startsWith("+91")) {
      phone = "+91" + phone.replace(/^\+?0*/, "");
    }

    // Prepare update data
    const updateData = {
      name: form.username,
      email: form.email,
      phone,
    };

    updateData.pan_card_verification = form.pan_verification;
    updateData.aadhar_card_verification = form.aadhar_verification;

    // Handle bank data
    if (form.bank_account_number || form.bank_ifsc_number) {
      updateData.bank_data = [
        {
          bank_account_number: form.bank_account_number,
          bank_ifsc_number: form.bank_ifsc_number,
        },
      ];
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      const res = await authenticatedFetch(
        `${API_BASE_URL}/users/${user.user_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      if (!res.ok) throw new Error("Failed to update user");

      const data = await res.json();
      const updatedUser = data.user || data;
      setUser(updatedUser);
      // Use the showToast prop instead of setting success state
      if (typeof showToast === "function") {
        showToast("User updated successfully!");
      }
      setModalOpen(false);
      fetchUserDetails(user.user_id);
    } catch (err) {
      setError("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleContract = (contractId) => {
    if (expandedContract === contractId) {
      setExpandedContract(null);
    } else {
      setExpandedContract(contractId);
    }
  };

  const handleContractClick = (contractId, contractName) => {
    // Store the search term in sessionStorage for the contract page to use
    sessionStorage.setItem("contractSearch", contractId);

    // Navigate to the contract page
    window.location.href = "/contract";
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setDisplayCount(5); // Reset display count when search changes
  };

  const filteredContracts =
    userDetails?.contracts?.filter((contract) => {
      if (!searchTerm) return true;
      return (
        contract.contract_unique_id
          ?.toUpperCase()
          .includes(searchTerm.toUpperCase()) ||
        contract.project_name?.toUpperCase().includes(searchTerm.toUpperCase())
      );
    }) || [];

  const showMoreContracts = () => {
    setDisplayCount((prev) => prev + 5);
  };

  const showAllContracts = () => {
    setDisplayCount(filteredContracts.length);
  };

  const displayedContracts = filteredContracts.slice(0, displayCount);
  const hasMoreToShow = displayCount < filteredContracts.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, type: "spring" }}
      className="bg-white/90 shadow-lg rounded-xl p-6 flex flex-col gap-2 border border-[#e0e0e0] hover:shadow-xl transition-all duration-200"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center w-12 h-12 text-2xl font-bold text-[#3b158a] rounded-full shadow-md bg-[#EDE7F6]">
          {(user.username || user.user_id || "")[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-lg text-[#3b158a] flex items-center gap-2">
            {user.username}
          </div>
          <div className="text-xs text-gray-500">User ID: {user.user_id}</div>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <div>
          <span className="font-medium text-gray-700">Email:</span> {user.email}
        </div>
        <div>
          <span className="font-medium text-gray-700">Phone:</span> {user.phone}
        </div>
        <div>
          <span className="font-medium text-gray-700">Contracts:</span>{" "}
          {user.contract_count || userDetails?.contracts?.length || 0}
        </div>
        <div>
          <span className="font-medium text-gray-700">Created:</span>{" "}
          {user.created_at}
        </div>
        <div className="flex gap-2 mt-2">
          <span className="font-medium text-gray-700">KYC:</span>
          {badge(`PAN: ${panStatus}`, panColor)}
          {badge(`Aadhaar: ${aadharStatus}`, aadharColor)}
        </div>

        {/* Bank Details */}
        {user.user_confidential_data?.bank_data?.length > 0 && (
          <div className="mt-2 rounded-md">
            <div className="mb-1 font-medium text-gray-700">Bank Details:</div>
            <div className="flex items-center gap-4 pl-2 text-sm">
              <div>
                <span className="font-medium">Account:</span>{" "}
                {user.user_confidential_data.bank_data[0].bank_account_number ||
                  "N/A"}
              </div>
              <div>
                <span className="font-medium">IFSC:</span>{" "}
                {user.user_confidential_data.bank_data[0].bank_ifsc_number ||
                  "N/A"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contracts Section */}
      {userDetails?.contracts && userDetails.contracts.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setContractsExpanded(!contractsExpanded)}
            className="flex items-center justify-between w-full p-3 font-medium text-[#3b158a] bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Contracts ({userDetails.contracts.length})</span>
            </div>
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-[#3b158a]">
              {contractsExpanded ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </span>
          </button>

          {contractsExpanded && (
            <>
              <div className="relative flex items-center justify-end mt-3 mb-3">
                <input
                  type="text"
                  placeholder="Search by contract ID or name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className=" p-2 pl-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3b158a] focus:border-[#3b158a] w-96 "
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute right-4 top-2.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="pr-1 space-y-3 overflow-y-auto max-h-72 custom-scrollbar">
                {displayedContracts.length === 0 ? (
                  <div className="py-4 text-center text-gray-500">
                    No contracts found
                  </div>
                ) : (
                  displayedContracts.map((contract) => (
                    <div
                      key={contract._id}
                      className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      <div
                        className={`p-3 cursor-pointer flex justify-between items-center transition-colors ${
                          expandedContract === contract._id
                            ? "bg-[#f5f2fc] border-b border-gray-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => toggleContract(contract._id)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent toggling the contract
                              handleContractClick(
                                contract.contract_unique_id,
                                contract.project_name
                              );
                            }}
                            className="p-1 rounded-full cursor-pointer hover:bg-purple-100"
                            title="Search this contract"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-[#3b158a]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                          </div>

                          <div
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent toggling the contract
                              handleContractClick(
                                contract.contract_unique_id,
                                contract.project_name
                              );
                            }}
                            className="font-medium text-[#3b158a] truncate mr-2 cursor-pointer hover:underline"
                            title="Search this contract"
                          >
                            {contract.project_name || "Unnamed Project"}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent toggling the contract
                              handleContractClick(
                                contract.contract_unique_id,
                                contract.project_name
                              );
                            }}
                            className="text-xs bg-[#f0ebfa] text-[#3b158a] px-2 py-1 rounded-md border border-[#e6dff8] cursor-pointer hover:bg-[#e6dff8] transition-colors"
                            title="Search this contract"
                          >
                            {contract.contract_unique_id}
                          </div>
                          <span className="flex items-center justify-center w-5 h-5 text-gray-500 bg-gray-100 rounded-full">
                            {expandedContract === contract._id ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            )}
                          </span>
                        </div>
                      </div>

                      {expandedContract === contract._id && (
                        <div className="p-4 bg-white">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <div className="mb-1 text-xs text-gray-500">
                                Trade Type
                              </div>
                              <div className="text-sm font-medium">
                                {contract.trade_type || "Not specified"}
                              </div>
                            </div>
                            <div>
                              <div className="mb-1 text-xs text-gray-500">
                                Amount
                              </div>
                              <div className="text-sm font-medium">
                                ₹{contract.project_amount || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="mb-1 text-xs text-gray-500">
                                Deadline
                              </div>
                              <div className="text-sm">
                                {contract.project_deadline
                                  ? new Date(
                                      contract.project_deadline
                                    ).toLocaleDateString()
                                  : "Not specified"}
                              </div>
                            </div>
                            <div>
                              <div className="mb-1 text-xs text-gray-500">
                                Status
                              </div>
                              <div className="text-sm">
                                {contract.project_completed_status ? (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-4 h-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    Completed
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[#3b158a]">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-4 h-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    In Progress
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="mb-1 text-xs text-gray-500">
                              Description
                            </div>
                            <p className="p-3 text-sm text-gray-700 rounded-md bg-gray-50">
                              {contract.project_description ||
                                "No description available"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {hasMoreToShow && (
                <div className="flex justify-center gap-2 mt-3">
                  <button
                    onClick={showMoreContracts}
                    className="px-3 py-1 text-sm text-[#3b158a] border border-[#3b158a] rounded-md hover:bg-[#f5f2fc]"
                  >
                    Show 5 More
                  </button>
                  <button
                    onClick={showAllContracts}
                    className="px-3 py-1 text-sm text-[#3b158a] border border-[#3b158a] rounded-md hover:bg-[#f5f2fc]"
                  >
                    Show All ({filteredContracts.length})
                  </button>
                </div>
              )}

              {filteredContracts.length > 0 && (
                <div className="mt-2 text-xs text-center text-gray-500">
                  Showing {displayedContracts.length} of{" "}
                  {filteredContracts.length} contracts
                </div>
              )}
            </>
          )}
        </div>
      )}

      {loadingDetails && (
        <div className="flex items-center justify-center gap-2 py-4 text-center text-gray-500">
          <svg
            className="animate-spin h-5 w-5 text-[#3b158a]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading contracts...
        </div>
      )}

      {canUpdate && (
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-[#3b158a] text-white rounded-lg font-semibold hover:bg-[#4527a0] transition-colors w-fit"
            onClick={() => setModalOpen(true)}
          >
            Update
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <form
            className="relative w-full max-w-md p-8 bg-white shadow-lg rounded-xl"
            onSubmit={handleUpdate}
          >
            <h3 className="text-xl font-bold mb-4 text-[#3b158a]">
              Update User
            </h3>
            {error && <div className="mb-2 text-red-600">{error}</div>}

            <input
              className="w-full p-2 mb-4 border rounded"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              placeholder="Username"
            />
            <input
              className="w-full p-2 mb-4 border rounded"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              type="email"
              placeholder="Email"
            />
            <input
              className="w-full p-2 mb-4 border rounded"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="Phone"
            />

            <div className="mb-4">
              <h4 className="font-semibold text-[#3b158a] mb-2">
                KYC Verification
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded">
                  <label className="block mb-2 font-medium">
                    PAN Verification
                  </label>
                  <select
                    name="pan_verification"
                    value={form.pan_verification ? "enabled" : "disabled"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        pan_verification: e.target.value === "enabled",
                      }))
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="disabled">Disabled</option>
                    <option value="enabled">Enabled</option>
                  </select>
                </div>

                <div className="p-3 border rounded">
                  <label className="block mb-2 font-medium">
                    Aadhaar Verification
                  </label>
                  <select
                    name="aadhar_verification"
                    value={form.aadhar_verification ? "enabled" : "disabled"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        aadhar_verification: e.target.value === "enabled",
                      }))
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="disabled">Disabled</option>
                    <option value="enabled">Enabled</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-[#3b158a] mb-2">
                Bank Information
              </h4>
              <input
                className="w-full p-2 mb-2 border rounded"
                name="bank_account_number"
                value={form.bank_account_number}
                onChange={handleChange}
                placeholder="Bank Account Number"
              />
              <input
                className="w-full p-2 mb-4 border rounded"
                name="bank_ifsc_number"
                value={form.bank_ifsc_number}
                onChange={handleChange}
                placeholder="IFSC Code"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-[#3b158a]"
                onClick={() => setModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#3b158a] text-white rounded hover:bg-[#4527a0]"
                disabled={loading}
              >
                {loading ? "Updating..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
}
