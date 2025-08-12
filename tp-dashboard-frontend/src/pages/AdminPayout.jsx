import React from "react";
import AdminPayoutData from "../components/AdminPayoutData";
import { useLocation } from "react-router-dom";

export default function AdminPayout() {
  const location = useLocation();
  // Get contractId from location.state (set by DashboardLayout search bar)
  const contractId = location.state?.contractId || "";

  return (
    <div className="p-8 rounded-2xl">
      <h2 className="flex items-center gap-2 mb-8 text-3xl font-semibold md:text-3xl text-[#3b158a] text-center mx-auto justify-center">
        Admin Payout
      </h2>
      <AdminPayoutData contractId={contractId} />
    </div>
  );
}
