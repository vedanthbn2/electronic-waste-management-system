"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface RecyclingRequest {
  id: string;
  userId: string;
  fullName: string;
  phone: number;
  category: string;
  status: string;
  receivedBy?: string;
}

const PickupRequestedPage: React.FC = () => {
  const [requests, setRequests] = useState<RecyclingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("/api/recycling-requests");
        setRequests(
          response.data.map((req: any) => ({
            id: req._id || req.id || Math.random().toString(36).substr(2, 9),
            userId: req.userId || "",
            fullName: req.fullName || "",
            phone: req.phone || 0,
            category: req.category || "Unknown",
            status: req.status || "pending",
            receivedBy: req.receivedBy || "",
          }))
        );
      } catch (error) {
        console.error("Error fetching pickup requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleRowClick = (id: string) => {
    router.push(`/admin/pickup-requested/${id}`);
  };

  if (loading) {
    return <div className="p-8">Loading pickup requests...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Pickup Requested</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden cursor-pointer">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">User ID</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Phone Number</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Received By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((request) => (
              <tr
                key={request.id}
                onClick={() => handleRowClick(request.id)}
                className="hover:bg-gray-100"
              >
                <td className="py-3 px-4">{request.userId}</td>
                <td className="py-3 px-4">{request.fullName}</td>
                <td className="py-3 px-4">{request.phone}</td>
                <td className="py-3 px-4">{request.category}</td>
                <td className="py-3 px-4">{request.status}</td>
                <td className="py-3 px-4">{request.receivedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PickupRequestedPage;
