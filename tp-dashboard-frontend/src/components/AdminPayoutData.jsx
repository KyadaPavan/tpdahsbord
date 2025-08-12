import React, { useEffect, useState } from "react";

export default function AdminPayoutData({ contractId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!contractId) return;
    setLoading(true);
    setError(null);
    setData(null);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    fetch(`${baseUrl}/admin-payouts/${contractId}`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `Error: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        console.log("AdminPayoutData fetched:", json);
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(json.message || "No payout data found");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [contractId]);

  if (!contractId) {
    return (
      <div className="text-center text-gray-500">
        Please search for a contract ID.
      </div>
    );
  }
  if (loading)
    return (
      <div className="text-center text-gray-500">Loading payout data...</div>
    );
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!data) return null;

  // Show only selected fields in a card layout
  const {
    contract_unique_id,
    bank_id,
    amount,
    original_amount,
    status,
    project_name,
    seller_bank_details = {},
  } = data;

  return (
    <div className="max-w-md p-6 mx-auto mt-6 bg-white shadow rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#3b158a]">Payout Details</h3>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg shadow hover:bg-green-600 focus:ring-green-400 "
            // onClick={handleApprove}
          >
            Approve
          </button>
          <button
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg shadow hover:bg-red-600 focus:ring-red-400 "
            // onClick={handleReject}
          >
            Reject
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b">
          <span className="font-medium text-gray-600">Contract Unique ID</span>
          <span className="text-gray-900">{contract_unique_id}</span>
        </div>
        <div className="flex items-center justify-between pb-2 border-b">
          <span className="font-medium text-gray-600">Bank ID</span>
          <span className="text-gray-900">{bank_id}</span>
        </div>
        <div className="flex items-center justify-between pb-2 border-b">
          <span className="font-medium text-gray-600">Amount</span>
          <span className="text-gray-900">₹{amount}</span>
        </div>
        <div className="flex items-center justify-between pb-2 border-b">
          <span className="font-medium text-gray-600">Original Amount</span>
          <span className="text-gray-900">₹{original_amount}</span>
        </div>
        <div className="flex items-center justify-between pb-2 border-b">
          <span className="font-medium text-gray-600">Status</span>
          <span className="text-gray-900 capitalize">{status}</span>
        </div>
        <div className="flex items-center justify-between pb-2 border-b">
          <span className="font-medium text-gray-600">Project Name</span>
          <span className="text-gray-900">{project_name}</span>
        </div>
        <div className="pt-2">
          <span className="block mb-1 font-medium text-gray-600">
            Seller Bank Details
          </span>
          <div className="p-3 rounded bg-gray-50">
            {Object.entries(seller_bank_details).length === 0 ? (
              <span className="text-gray-400">No bank details available</span>
            ) : (
              <ul className="space-y-1">
                {Object.entries(seller_bank_details).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span className="text-gray-500">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-gray-900">{value}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
