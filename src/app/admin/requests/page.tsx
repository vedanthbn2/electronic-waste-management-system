"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken, getUser } from "../../sign-in/auth";
import Link from "next/link";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface RecyclingRequest {
  id: string;
  userId: string;
  userEmail: string;
  recycleItem: string;
  recycleItemPrice?: number;
  pickupDate: string;
  pickupTime: string;
  fullName: string;
  address: string;
  phone: number;
  location?: Location;
  deviceCondition?: string;
  accessories?: string[];
  preferredContactNumber?: string;
  alternateContactNumber?: string;
  specialInstructions?: string;
  declarationChecked?: boolean;
  status: string;
  createdAt: string;
}

const RequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<RecyclingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchRequests = async () => {
      try {
        const token = getToken();
        const user = getUser();
        if (!token || !user || (user as any).role !== "admin") {
          window.location.href = "/sign-in";
          return;
        }

        const response = await axios.get("/api/recycling-requests");
        setRequests(response.data.map((req: any) => ({
          id: req._id || Math.random().toString(36).substr(2, 9),
          userId: req.userId || "",
          userEmail: req.userEmail || "",
          recycleItem: req.recycleItem || "",
          recycleItemPrice: req.recycleItemPrice,
          pickupDate: req.pickupDate || "",
          pickupTime: req.pickupTime || "",
          fullName: req.fullName || "",
          address: req.address || "",
          phone: req.phone || 0,
          location: req.location,
          deviceCondition: req.deviceCondition,
          accessories: req.accessories,
          preferredContactNumber: req.preferredContactNumber,
          alternateContactNumber: req.alternateContactNumber,
          specialInstructions: req.specialInstructions,
          declarationChecked: req.declarationChecked,
          status: req.status || "pending",
          createdAt: req.createdAt || new Date().toISOString(),
        })));
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (!mounted || loading) {
    return <div className="p-8">Loading requests...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Recycling Requests</h1>
      <nav className="mb-4">
        <Link href="/admin/pickup-requested" className="text-blue-600 hover:underline">
          View Pickup Requested
        </Link>
      </nav>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">User Email</th>
              <th className="py-3 px-4 text-left">Recycle Item</th>
              <th className="py-3 px-4 text-left">Pickup Date</th>
              <th className="py-3 px-4 text-left">Pickup Time</th>
              <th className="py-3 px-4 text-left">Full Name</th>
              <th className="py-3 px-4 text-left">Address</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Device Condition</th>
              <th className="py-3 px-4 text-left">Accessories</th>
              <th className="py-3 px-4 text-left">Special Instructions</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="py-3 px-4">{request.id}</td>
                <td className="py-3 px-4">{request.userEmail}</td>
                <td className="py-3 px-4">{request.recycleItem}</td>
                <td className="py-3 px-4">{request.pickupDate}</td>
                <td className="py-3 px-4">{request.pickupTime}</td>
                <td className="py-3 px-4">{request.fullName}</td>
                <td className="py-3 px-4">{request.address}</td>
                <td className="py-3 px-4">{request.phone}</td>
                <td className="py-3 px-4">{request.deviceCondition}</td>
                <td className="py-3 px-4">{request.accessories?.join(", ")}</td>
                <td className="py-3 px-4">{request.specialInstructions}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    request.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : request.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="py-3 px-4">{new Date(request.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  {request.location ? (
                    <a
                      href={`https://www.google.com/maps?q=${request.location.lat},${request.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {request.location.address || `${request.location.lat.toFixed(4)}, ${request.location.lng.toFixed(4)}`}
                    </a>
                  ) : (
                    <span className="text-gray-400">No location</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestsPage;
