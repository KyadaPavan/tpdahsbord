// Contract.jsx
import { useLocation } from "react-router-dom";
import ContractData from "../components/ContractData";
import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";

export default function Contract() {
  const location = useLocation();
  const [contract, setContract] = useState(location.state?.contract);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm);
  const [error, setError] = useState(location.state?.error);
  const [loading, setLoading] = useState(false);
  const { user: dashboardUser } = useOutletContext();
  const { toastMessages, showToast, clearToasts } = useToast();
  useEffect(() => {
    const storedSearchTerm = sessionStorage.getItem("contractSearch");
    if (storedSearchTerm) {
      setSearchTerm(storedSearchTerm);
      sessionStorage.removeItem("contractSearch");
      searchContract(storedSearchTerm);
    } else if (searchTerm && !contract && !error) {
      searchContract(searchTerm);
    }
  }, []);

  useEffect(() => {
    if (location.state) {
      setContract(location.state.contract);
      setSearchTerm(location.state.searchTerm);
      setError(location.state.error);
    }
  }, [location.state]);

  // Function to search for a contract
  const searchContract = async (term) => {
    if (!term) return;

    setLoading(true);
    try {
      const contractId = term.toUpperCase();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/contracts/${encodeURIComponent(
          contractId
        )}`,
        { credentials: "include" }
      );

      if (!res.ok) {
        throw new Error("Contract not found");
      }

      const contractData = await res.json();
      console.log(contractData);
      setContract(contractData);
      setError(null);
    } catch (err) {
      setContract(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-[300px] md:py-6 lg:py-14 md:px-6 lg:px-14 bg-gray-100/80 rounded-2xl">
      <h2 className="flex items-center gap-2 mb-8 text-3xl font-semibold md:text-3xl text-[#3b158a] text-center mx-auto justify-center">
        Contract Management
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-[#3b158a] border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">Searching for contract...</span>
        </div>
      ) : error ? (
        <div className="py-4 text-center text-red-500">
          Contract not found for ID: {searchTerm}
        </div>
      ) : contract ? (
        <ContractData
          contract={contract}
          canUpdate={dashboardUser?.role === "admin"}
          showToast={showToast}
          isAdmin={dashboardUser?.role === "admin"}
        />
      ) : searchTerm ? (
        <div className="py-4 text-center text-gray-700">
          Searching for contract: {searchTerm}...
        </div>
      ) : (
        <p className="py-4 text-center text-gray-700 animate-fade-in">
          No Contract found. Use the search bar above to find a contract.
        </p>
      )}
      <Toast messages={toastMessages} onClose={clearToasts} />
    </div>
  );
}
