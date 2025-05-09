"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Request {
  id: string;
  createdAt: string;
  status: string;
  recycleItem: string;
  pickupDate: string;
  pickupTime: string;
}

const MyRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async () => {
      const userJSON = localStorage.getItem("user");
      const user = userJSON ? JSON.parse(userJSON) : null;
      if (!user) {
        router.push("/sign-in?message=signin to view your requests");
        return;
      }
      try {
        const response = await fetch("/api/recycling-requests");
        const data = await response.json();
        // Filter requests by logged-in user id
        const userRequests = data.filter((req: any) => req.userId === user.id);
        setRequests(userRequests);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [router]);

  if (loading) {
    return <div className="p-8">Loading your requests...</div>;
  }

  if (requests.length === 0) {
    return <div className="p-8">You have no requests.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Requests</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Request ID</th>
              <th className="py-3 px-4 text-left">E-waste Item</th>
              <th className="py-3 px-4 text-left">Pickup Date</th>
              <th className="py-3 px-4 text-left">Pickup Time</th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((req) => (
              <tr
                key={req.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => router.push(`/my-requests/${req.id}`)}
              >
                <td className="py-3 px-4">{req.id}</td>
                <td className="py-3 px-4">{req.recycleItem}</td>
                <td className="py-3 px-4">{req.pickupDate}</td>
                <td className="py-3 px-4">{req.pickupTime}</td>
                <td className="py-3 px-4 capitalize">{req.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyRequestsPage;
