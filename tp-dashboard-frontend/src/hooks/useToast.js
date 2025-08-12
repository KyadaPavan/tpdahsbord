import { useState } from 'react';

export default function useToast() {
  const [toastMessages, setToastMessages] = useState([]);

  const showToast = (messages) => {
    if (typeof messages === 'string') {
      setToastMessages([messages]);
    } else if (Array.isArray(messages)) {
      setToastMessages(messages);
    }
  };

  const clearToasts = () => {
    setToastMessages([]);
  };

  return {
    toastMessages,
    showToast,
    clearToasts
  };
}