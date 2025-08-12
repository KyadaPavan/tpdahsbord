import React, { useState, useEffect } from "react";

export default function ContractUpdateModal({
  contract,
  open,
  onClose,
  onUpdated,
}) {
  const [form, setForm] = useState({});
  const [changed, setChanged] = useState(false);
  const [changes, setChanges] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (contract) {
      setForm(contract);
      setChanged(false);
      setChanges([]);
      setErrors({});
    }
  }, [contract, open]);

  if (!open || !contract) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Track changes
      const diff = Object.keys(contract).filter(
        (key) => updated[key] !== contract[key]
      );
      setChanged(diff.length > 0);
      setChanges(diff);
      return updated;
    });
    setErrors((prev) => ({ ...prev, [e.target.name]: !e.target.value }));
  };

  const validate = () => {
    const newErrors = {};
    Object.entries(form).forEach(([key, value]) => {
      if (
        (typeof value === "string" || typeof value === "number") &&
        key !== "contract_unique_id" &&
        !String(value).trim()
      ) {
        newErrors[key] = true;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const updatedFields = {};
    changes.forEach((key) => {
      updatedFields[key] = form[key];
    });
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      const res = await fetch(
        `${API_BASE_URL}/contracts/${contract.contract_unique_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatedFields),
        }
      );
      if (res.ok) {
        const notifMsgs = changes.map(
          (key) =>
            `Field '${key}' updated from '${contract[key]}' to '${form[key]}'`
        );
        onUpdated && onUpdated({ ...contract, ...updatedFields }, notifMsgs);
      } else {
        onUpdated && onUpdated(contract, ["Update failed. Please try again."]);
      }
    } catch (e) {
      onUpdated && onUpdated(contract, ["Network error. Please try again."]);
    }
  };

  // Professional close icon SVG
  const CloseIcon = (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#888"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="11" fill="#f3f4f6" />
      <line x1="8" y1="8" x2="16" y2="16" />
      <line x1="16" y1="8" x2="8" y2="16" />
    </svg>
  );

  // Responsive two-column form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative w-full max-w-2xl p-6 bg-white shadow-xl rounded-xl animate-fade-in">
        <button
          className="absolute p-1 transition top-3 right-3 hover:scale-110"
          onClick={onClose}
          aria-label="Close"
          style={{ background: "none", border: "none" }}
        >
          {CloseIcon}
        </button>
        <h2 className="text-xl font-bold mb-4 text-[#5e35b1]">
          Update Contract
        </h2>
        <form
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          onSubmit={handleUpdate}
        >
          {Object.entries(contract).map(([key, value]) =>
            typeof value === "string" || typeof value === "number" ? (
              <div key={key} className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">
                  {key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
                <input
                  className={`border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#5e35b1] ${
                    errors[key] ? "border-red-400" : ""
                  } ${
                    key === "contract_unique_id" ||
                    key === "trade_type" ||
                    key === "contract_created"
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                  name={key}
                  value={form[key] ?? ""}
                  onChange={handleChange}
                  disabled={
                    key === "contract_unique_id" ||
                    key === "trade_type" ||
                    key === "contract_created"
                  }
                />
                {errors[key] && (
                  <span className="mt-1 text-xs text-red-500">
                    This field is required.
                  </span>
                )}
              </div>
            ) : null
          )}
          <div className="flex justify-end sm:col-span-2">
            <button
              type="submit"
              className={`mt-2  py-2 rounded bg-[#3b158a] text-white font-semibold transition disabled:bg-gray-300 disabled:text-gray-500 w-fit`}
              disabled={!changed}
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
