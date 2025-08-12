import { useEffect, useState } from "react";

export default function QueryToast({ messages = [], onClose }) {
  // Helper functions to determine styling based on message content
  const getIconForMessage = (message) => {
    if (message.includes("created")) {
      return (
        <svg
          width="36"
          height="36"
          fill="none"
          viewBox="0 0 24 24"
          className="text-current"
        >
          <path
            d="M9 12l2 2 4-4M12 21a9 9 0 100-18 9 9 0 000 18z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    } else if (message.includes("updated") || message.includes("added")) {
      return (
        <svg
          width="36"
          height="36"
          fill="none"
          viewBox="0 0 24 24"
          className="text-current"
        >
          <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    } else if (message.includes("deleted")) {
      return (
        <svg
          width="36"
          height="36"
          fill="none"
          viewBox="0 0 24 24"
          className="text-current"
        >
          <path
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    } else {
      return (
        <svg
          width="36"
          height="36"
          fill="none"
          viewBox="0 0 24 24"
          className="text-current"
        >
          <path
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
  };
  
  const getStyleForMessage = (message) => {
    if (message.includes("created")) {
      return {
        bg: "bg-[#ede7f6]",
        text: "text-[#5e35b1]",
        progressBg: "bg-[#d1c4e9]",
        progressFill: "bg-[#5e35b1]"
      };
    } else if (message.includes("updated") || message.includes("added")) {
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        progressBg: "bg-blue-100",
        progressFill: "bg-blue-700"
      };
    } else if (message.includes("deleted")) {
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        progressBg: "bg-red-100",
        progressFill: "bg-red-700"
      };
    } else {
      return {
        bg: "bg-[#ede7f6]",
        text: "text-[#5e35b1]",
        progressBg: "bg-[#d1c4e9]",
        progressFill: "bg-[#5e35b1]"
      };
    }
  };
  const [visibleMessages, setVisibleMessages] = useState([]);

  useEffect(() => {
    if (messages.length > 0) {
      // Add new messages with animation state
      const newMessages = messages.map((msg, index) => ({
        id: Date.now() + index,
        text: msg,
        isVisible: false,
        isExiting: false,
      }));

      setVisibleMessages(newMessages);

      // Trigger entrance animation
      setTimeout(() => {
        setVisibleMessages((prev) =>
          prev.map((msg) => ({ ...msg, isVisible: true }))
        );
      }, 100);

      // Start exit animation before removing
      const exitTimer = setTimeout(() => {
        setVisibleMessages((prev) =>
          prev.map((msg) => ({ ...msg, isExiting: true }))
        );
      }, 3000);

      // Remove messages after exit animation
      const removeTimer = setTimeout(() => {
        setVisibleMessages([]);
        onClose();
      }, 3500);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [messages, onClose]);

  if (!visibleMessages.length) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none">
      {visibleMessages.map((msg) => (
        <div
          key={msg.id}
          className={`
            w-[450px] max-w-full
            transform transition-all duration-500 ease-out pointer-events-auto
            ${
              msg.isVisible && !msg.isExiting
                ? "translate-y-0 opacity-100 scale-100"
                : msg.isExiting
                ? "translate-y-2 opacity-0 scale-95"
                : "translate-y-4 opacity-0 scale-95"
            }
          `}
        >
          <div className={`px-6 py-4 border shadow-2xl rounded-2xl backdrop-blur-sm ${getStyleForMessage(msg.text).bg} ${getStyleForMessage(msg.text).text}`}>
            <div className="flex items-center gap-3">
              {/* Success Icon with Animation */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full">
                    {getIconForMessage(msg.text)}
                  </div>
                  {/* Subtle pulse animation */}
                  <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: 'currentColor', opacity: '0.1' }}></div>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1">
                <p className="text-sm font-semibold leading-relaxed tracking-wide">
                  {msg.text}
                </p>
              </div>

              {/* Subtle Close Button */}
              <button
                onClick={() => {
                  setVisibleMessages((prev) =>
                    prev.filter((m) => m.id !== msg.id)
                  );
                  if (visibleMessages.length === 1) onClose();
                }}
                className="flex-shrink-0 ml-2 duration-200"
                aria-label="Close notification"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Progress Bar */}
            <div className={`h-1 mt-3 overflow-hidden rounded-full ${getStyleForMessage(msg.text).progressBg}`}>
              <div
                className={`h-full rounded-full transition-all duration-[3000ms] ease-linear ${getStyleForMessage(msg.text).progressFill}`}
                style={{
                  width: msg.isVisible && !msg.isExiting ? "0%" : "100%",
                  transition:
                    msg.isVisible && !msg.isExiting
                      ? "width 3000ms linear"
                      : "none",
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}