import QueryData from "./QueryData";
import { useOutletContext } from "react-router-dom";
import { useState } from "react";
import QueryToast from "../components/QueryToast";

export default function Query() {
  const { user } = useOutletContext();
  const [toastMessages, setToastMessages] = useState([]);

  const showToast = (message) => {
    setToastMessages([message]);
  };

  const handleCloseToast = () => {
    setToastMessages([]);
  };

  return (
    <div className="p-6 md:py-6 lg:py-8 md:px-6 lg:px-14 rounded-2xl bg-gray-100/80">
      <QueryData dashboardUser={user} showToast={showToast} />
      <QueryToast messages={toastMessages} onClose={handleCloseToast} />
    </div>
  );
}
