"use client";

import React, { useEffect, useState } from "react";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  userId?: string | null;
  receiverId?: string | null;
  onClose: () => void;
}

const NotificationDropdown = ({ userId, receiverId, onClose }: NotificationDropdownProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const params = new URLSearchParams();
        if (userId) params.append("userId", userId);
        if (receiverId) params.append("receiverId", receiverId);

        const res = await fetch(`/api/notifications?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId, receiverId]);

  return (
    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white shadow-lg rounded-md z-50">
      <div className="p-4 border-b font-semibold text-gray-700 flex justify-between items-center">
        <span>Notifications</span>
        <button
          aria-label="Close notifications"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 font-bold text-lg"
        >
          &times;
        </button>
      </div>
      {loading ? (
        <div className="p-4 text-center text-gray-500">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No notifications</div>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                notification.read ? "text-gray-500" : "font-medium text-gray-900"
              }`}
              onClick={onClose}
            >
              <div>{notification.message}</div>
              <div className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationDropdown;
