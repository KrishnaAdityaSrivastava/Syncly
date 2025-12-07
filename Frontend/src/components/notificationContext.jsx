// NotificationContext.jsx
import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback(
    (message, type = "info", action) => {
      setNotification({ message, type, action });
      setTimeout(() => setNotification(null), 3000);
    },
    []
  );

  const contextValue = useMemo(() => ({ showNotification }), [showNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {notification && (
        <NotificationToast
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </NotificationContext.Provider>
  );
}

// Notification Toast
function NotificationToast({ notification, onClose }) {
  const stylesMap = {
    success: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: "text-green-600" },
    error: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: "text-red-600" },
    info: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-800", icon: "text-indigo-600" },
  };

  const getIcon = (type) =>
    type === "success" ? <CheckCircle className="w-5 h-5" /> :
    type === "error" ? <XCircle className="w-5 h-5" /> :
    <Info className="w-5 h-5" />;

  const currentStyles = stylesMap[notification.type] || stylesMap.info;

  // Clicking anywhere closes AND triggers the action if provided
  const handleClick = () => {
    onClose(); // dismiss notification
    if (notification.action) notification.action(); // run action
  };

  return (
    <div
      onClick={handleClick}
      className={`
        fixed top-5 right-5 z-50 flex items-center gap-3 max-w-sm p-4 rounded-xl border
        shadow-md text-sm font-medium break-words cursor-pointer
        transition-opacity duration-300 ease-in-out
        ${currentStyles.bg} ${currentStyles.border}
        hover:opacity-90
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${currentStyles.icon}`}>
        {getIcon(notification.type)}
      </div>

      {/* Message */}
      <div className={`${currentStyles.text} flex-1`}>
        {notification.message}
      </div>
    </div>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
