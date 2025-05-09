"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface RequestDetail {
  id: string;
  userId: string;
  userEmail?: string;
  recycleItem: string;
  recycleItemPrice?: number;
  pickupDate: string;
  pickupTime: string;
  fullName: string;
  address: string;
  phone: number;
  status: string;
  createdAt: string;
  assignedReceiver?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  deviceCondition?: string;
  accessories?: string[];
  preferredContactNumber?: string;
  alternateContactNumber?: string;
  specialInstructions?: string;
  declarationChecked?: boolean;
  deviceImageUrl?: string;
  category?: string;
  model?: string;
}

const MyRequestDetailPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch("/api/recycling-requests");
        const data = await response.json();
        const found = data.find((req: any) => (req._id || req.id) === id);
        if (found) {
          setRequest({
            id: found._id || found.id,
            userId: found.userId || "",
            userEmail: found.userEmail || "",
            recycleItem: found.recycleItem || "",
            recycleItemPrice: found.recycleItemPrice,
            pickupDate: found.pickupDate || "",
            pickupTime: found.pickupTime || "",
            fullName: found.fullName || "",
            address: found.address || "",
            phone: found.phone || 0,
            status: found.status || "pending",
            createdAt: found.createdAt || new Date().toISOString(),
            assignedReceiver: found.assignedReceiver,
            deviceCondition: found.deviceCondition,
            accessories: found.accessories,
            preferredContactNumber: found.preferredContactNumber,
            alternateContactNumber: found.alternateContactNumber,
            specialInstructions: found.specialInstructions,
            declarationChecked: found.declarationChecked,
            deviceImageUrl: found.deviceImageUrl || null,
            category: found.category || "",
            model: found.model || "",
          });
        } else {
          setRequest(null);
        }
      } catch (error) {
        console.error("Error fetching request detail:", error);
        setRequest(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  if (loading) {
    return <div className="p-8">Loading request details...</div>;
  }

  if (!request) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">Request not found</h2>
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded"
          onClick={() => router.back()}
        >
          Go Back
        </button>
      </div>
    );
  }

  const renderTrackOrderStatus = () => {
    if (request.status === "approved") {
      return (
        <>
          <p className="text-green-600 font-semibold">Request Accepted</p>
          {request.assignedReceiver ? (
            <p className="text-blue-600 font-semibold mt-2">
              Scheduled to receiver: {request.assignedReceiver.name}
            </p>
          ) : (
            <p className="text-gray-600 mt-2">Waiting for receiver assignment</p>
          )}
        </>
      );
    } else if (request.status === "collected") {
      return (
        <p className="text-green-700 font-semibold">Pickup request approved and collected</p>
      );
    } else {
      return <p className="text-red-600 font-semibold">Request not accepted yet</p>;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Request Details</h1>
      <div className="mb-4">
        <strong>Request ID:</strong> {request.id}
      </div>
      <div className="mb-4">
        <strong>Full Name:</strong> {request.fullName}
      </div>
      <div className="mb-4">
        <strong>Phone:</strong> {request.phone}
      </div>
      <div className="mb-4">
        <strong>Category:</strong> {request.category}
      </div>
      <div className="mb-4">
        <strong>Model:</strong> {request.model || request.recycleItem}
      </div>
      <div className="mb-4">
        <strong>Device Condition:</strong> {request.deviceCondition || "N/A"}
      </div>
      <div className="mb-4">
        <strong>Accessories Included:</strong> {request.accessories?.join(", ") || "None"}
      </div>
      <div className="mb-4">
        <strong>Image Uploaded:</strong>{" "}
        {request.deviceImageUrl ? (
          <img src={request.deviceImageUrl} alt="Device" className="max-w-xs" />
        ) : (
          "No image uploaded"
        )}
      </div>
      <div className="mb-4">
        <strong>Pickup Date:</strong> {request.pickupDate}
      </div>
      <div className="mb-4">
        <strong>Pickup Time:</strong> {request.pickupTime}
      </div>
      <div className="mb-4">
        <strong>Pickup Address:</strong> {request.address}
      </div>
      <div className="mb-4">
        <strong>Preferred Contact Number:</strong> {request.preferredContactNumber || "N/A"}
      </div>
      <div className="mb-4">
        <strong>Alternate Contact Number:</strong> {request.alternateContactNumber || "N/A"}
      </div>
      <div className="mb-4">
        <strong>Special Pickup Instructions:</strong> {request.specialInstructions || "None"}
      </div>
      <div className="mb-4">
        <strong>Declaration Checked:</strong> {request.declarationChecked ? "Yes" : "No"}
      </div>
      <div className="mb-4">
        <strong>Location:</strong>{" "}
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
          "No location"
        )}
      </div>
      <div className="mb-4">
        <strong>Status:</strong> {request.status}
      </div>
      <div className="mb-4">
        <strong>Created At:</strong> {new Date(request.createdAt).toLocaleString()}
      </div>
      <div className="mb-4">
        <strong>Track Order:</strong>
        <div className="mt-2">{renderTrackOrderStatus()}</div>
      </div>
      <button
        className="bg-blue-600 text-white py-2 px-4 rounded"
        onClick={() => router.back()}
      >
        Back to My Requests
      </button>
    </div>
  );
};

export default MyRequestDetailPage;
