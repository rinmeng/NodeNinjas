import React, { createContext, useState, useContext, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { CircleAlert, CircleCheck } from "lucide-react";

// Create context
const ToastContext = createContext(undefined);

// Hook for using the toast context
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }) {
  const [feedbackMessage, setFeedbackMessage] = useState({
    title: "",
    description: "",
  });

  // Handle feedback messages
  useEffect(() => {
    if (feedbackMessage.title) {
      const isFeedbackSuccess = feedbackMessage.title
        .toLowerCase()
        .includes("success");
      toast(feedbackMessage.title, {
        description: feedbackMessage.description,
        duration: 3000,
        icon: isFeedbackSuccess ? (
          <CircleCheck className="text-green-500" />
        ) : (
          <CircleAlert className="text-black" />
        ),
        position: "bottom-right",
        classNames: {
          title: "ml-2 text-base font-bold",
          description: "ml-2",
        },
      });
      setFeedbackMessage({ title: "", description: "" });
    }
  }, [feedbackMessage]);

  // Function to show toast directly
  const showToast = (title, description, isSuccess = true) => {
    toast(title, {
      description,
      duration: 3000,
      icon: isSuccess ? (
        <CircleCheck className="text-green-500" />
      ) : (
        <CircleAlert className="text-black" />
      ),
      position: "bottom-right",
      classNames: {
        title: "ml-2 text-base font-bold",
        description: "ml-2",
      },
    });
  };

  return (
    <ToastContext.Provider value={{ setFeedbackMessage, showToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}
