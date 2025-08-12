import { useEffect, useState } from "react";
import { AlertCircle, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function TokenExpirationHandler() {
  const [showNotification, setShowNotification] = useState(false);
  const [message, setMessage] = useState("");
  const [isInactivityTimeout, setIsInactivityTimeout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleTokenExpired = (event) => {
      setMessage(event.detail.message);
      setIsInactivityTimeout(event.detail.isInactivityTimeout || false);
      setShowNotification(true);

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    };

    // Listen for token expiration events
    window.addEventListener("tokenExpired", handleTokenExpired);

    return () => {
      window.removeEventListener("tokenExpired", handleTokenExpired);
    };
  }, [navigate]);

  const handleClose = () => {
    setShowNotification(false);
    navigate("/login");
  };

  const getIcon = () => {
    return isInactivityTimeout ? (
      <Clock className="w-5 h-5 mr-2 flex-shrink-0" />
    ) : (
      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
    );
  };

  const getTitle = () => {
    return isInactivityTimeout ? "Session Timeout" : "Session Expired";
  };

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 text-white p-4 rounded-lg shadow-lg max-w-md ${
            isInactivityTimeout ? "bg-orange-500" : "bg-red-500"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              {getIcon()}
              <div>
                <p className="font-medium">{getTitle()}</p>
                <p className="text-sm opacity-90 mt-1">{message}</p>
                <p className="text-xs opacity-75 mt-2">
                  Redirecting to login in 3 seconds...
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="ml-4 text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
