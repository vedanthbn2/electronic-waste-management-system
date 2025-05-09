"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
}

const CustomersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch users from local API route
        const response = await axios.get("/api/users");
        setUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Customers</h1>
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <div className="flex space-x-8">
          <ul className="w-1/3 border rounded p-4 max-h-[600px] overflow-auto">
            {users.map((user) => (
              <li
                key={user.id}
                className="cursor-pointer py-2 border-b hover:bg-gray-100"
                onClick={() => setSelectedUser(user)}
              >
                {user.name}
              </li>
            ))}
          </ul>
          <div className="w-2/3 border rounded p-4 max-h-[600px] overflow-auto">
            {selectedUser ? (
              <>
                <h2 className="text-2xl font-semibold mb-4">{selectedUser.name}</h2>
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Phone Number:</strong> {selectedUser.phoneNumber}</p>
              </>
            ) : (
              <p>Select a customer to see details</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
