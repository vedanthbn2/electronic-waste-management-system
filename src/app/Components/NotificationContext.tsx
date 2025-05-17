"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface NotificationContextType {
  refreshNotifications: () => void;
  notificationRefreshCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notificationRefreshCount, setNotificationRefreshCount] = useState(0);

  const refreshNotifications = () => {
    setNotificationRefreshCount((count) => count + 1);
  };

  return (
    <NotificationContext.Provider value={{ refreshNotifications, notificationRefreshCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
