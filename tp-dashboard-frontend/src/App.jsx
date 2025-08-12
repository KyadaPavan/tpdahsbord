import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import Query from "./pages/Query";
import User from "./pages/User";
import Contract from "./pages/Contract";

import Login from "./pages/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminPayout from "./pages/AdminPayout";
import ActivityLog from "./pages/ActivityLog";
import { AuthProvider } from "./auth/AuthContext";
import TokenExpirationHandler from "./components/TokenExpirationHandler";
import "react-tooltip/dist/react-tooltip.css";
import { useContext } from "react";
import { AuthContext } from "./auth/AuthContext";
import { ShieldX } from "lucide-react";

// Custom wrapper to restrict admin-only routes
function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center p-4 pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="relative p-8 overflow-hidden text-center bg-white shadow-2xl rounded-2xl">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-600"></div>
            <div className="absolute w-20 h-20 bg-red-100 rounded-full -top-10 -right-10 opacity-20"></div>
            <div className="absolute w-16 h-16 bg-orange-100 rounded-full -bottom-10 -left-10 opacity-20"></div>

            {/* Icon */}
            <div className="relative mb-6">
              <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full shadow-lg bg-gradient-to-br from-red-500 to-red-600">
                <ShieldX className="w-10 h-10 text-white" />
              </div>
              {/* Pulsing animation ring */}
              <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-red-200 rounded-full opacity-25 animate-ping"></div>
            </div>

            {/* Main Message */}
            <h1 className="mb-4 text-3xl font-bold text-gray-800">
              Access Denied
            </h1>

            <p className="mb-2 text-lg text-gray-600">
              You don't have permission to access this page
            </p>

            <p className="mb-6 text-sm text-gray-500">
              Your current role:{" "}
              <span className="font-semibold text-[#3b158a] capitalize">
                {user?.role || "Unknown"}
              </span>
            </p>

            {/* Required Role Badge */}
            <div className="inline-flex items-center px-4 py-2 mb-6 border border-red-200 rounded-full bg-red-50">
              <svg
                className="w-4 h-4 mr-2 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-red-500">
                Admin Access Required
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <button
                onClick={() => (window.location.href = "/")}
                className="px-6 py-3 font-semibold text-gray-700 transition-all duration-200 bg-gray-100 border border-gray-300 rounded-lg w-fit hover:bg-gray-200"
              >
                Return to Dashboard
              </button>
            </div>

            {/* Footer Message */}
            <p className="mt-6 text-xs text-gray-400">
              Contact your administrator if you believe this is an error
            </p>
          </div>
        </div>
      </div>
    );
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TokenExpirationHandler />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Home />} />
              <Route path="query" element={<Query />} />
              <Route path="user" element={<User />} />
              <Route path="contract" element={<Contract />} />
              <Route
                path="admin-payout"
                element={
                  <AdminRoute>
                    <AdminPayout />
                  </AdminRoute>
                }
              />
              <Route
                path="activity-log"
                element={
                  <AdminRoute>
                    <ActivityLog />
                  </AdminRoute>
                }
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
