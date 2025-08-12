import { useLocation, useNavigate } from "react-router-dom";
import UserData from "../components/UserData";
import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import Toast from "../components/Toast";

export default function User() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: dashboardUser } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(location.state?.error);
  const [toastMessages, setToastMessages] = useState([]);
  const searchTerm = location.state?.searchTerm || "";

  useEffect(() => {
    let data = location.state?.users;
    // Handle if data is an array
    if (Array.isArray(data)) {
      setUsers(data);
      setError("");
    }
    // Handle if data is an object with a users array
    else if (data && typeof data === "object" && Array.isArray(data.users)) {
      setUsers(data.users);
      setError("");
    }
    // Handle unexpected object
    else if (data && typeof data === "object") {
      setUsers([]);
      setError("Unexpected response from server.");
    } else {
      setUsers([]);
    }
    if (location.state?.error) setError(location.state.error);
  }, [location.state]);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (error && error.toString().toLowerCase().includes("unauthorized")) {
      navigate("/login");
    }
  }, [error, navigate]);

  const showToast = (message) => {
    setToastMessages([message]);
  };

  const handleCloseToast = () => {
    setToastMessages([]);
  };

  return (
    <div className="p-6   min-h-[60vh] md:p-6 lg:p-14 bg-gray-100/80 rounded-2xl ">
      <h2 className="flex items-center justify-center gap-2 mb-4 text-3xl font-semibold  md:text-3xl  text-[#3b158a] text-center">
        User Management
        <span className="text-base font-normal text-gray-400">
          {searchTerm && `- Results for "${searchTerm}"`}
        </span>
      </h2>
      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-lg animate-pulse">
          {error}
        </div>
      )}
      {Array.isArray(users) && users.length === 0 && !error ? (
        <p className="text-center text-gray-700 animate-fade-in">
          No users found.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-1 lg:grid-cols-1">
          {Array.isArray(users) &&
            users.map((user, idx) => (
              <UserData
                key={user.user_id || idx}
                user={user}
                canUpdate={dashboardUser?.role === "admin"}
                showToast={showToast}
              />
            ))}
        </div>
      )}
      <Toast messages={toastMessages} onClose={handleCloseToast} />
    </div>
  );
}
