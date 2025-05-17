"use client";

import Image from "next/image";

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

  // Editable fields state
  const [editAddress, setEditAddress] = useState("");
  const [editPickupDate, setEditPickupDate] = useState("");
  const [editPickupTime, setEditPickupTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
          // Initialize editable fields
          setEditAddress(found.address || "");
          setEditPickupDate(found.pickupDate || "");
          setEditPickupTime(found.pickupTime || "");
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

  const editableStatuses = ["pending", "submitted"];
  const isEditable = request && editableStatuses.includes(request.status);

  const handleSave = async () => {
    if (!request) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const response = await fetch("/api/recycling-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: request.id,
          updates: {
            address: editAddress,
            pickupDate: editPickupDate,
            pickupTime: editPickupTime,
          },
        }),
      });
      const result = await response.json();
      if (result.success) {
        setRequest((prev) =>
          prev
            ? {
                ...prev,
                address: editAddress,
                pickupDate: editPickupDate,
                pickupTime: editPickupTime,
              }
            : prev
        );
        setSaveSuccess(true);
      } else {
        setSaveError(result.error || "Failed to save changes");
      }
    } catch (error) {
      setSaveError("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

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
    switch (request.status) {
      case "pending":
      case "submitted":
        return <p className="text-blue-600 font-semibold">Your request has been successfully submitted.</p>;
      case "approved":
        return <p className="text-green-600 font-semibold">Your request has been approved. Our partner will reach out to you as soon as possible.</p>;
      case "collected":
      case "picked_up":
        return <p className="text-yellow-600 font-semibold">Your e-waste has been collected by our partner.</p>;
      case "received":
      case "delivered":
        return <p className="text-green-700 font-semibold">Your e-waste has been received by the recycler.</p>;
      default:
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
        <strong>Device Condition:</strong> {request.deviceCondition || "N/A"}</div>
      <div className="mb-4">
        <strong>Accessories Included:</strong> {request.accessories?.join(", ") || "None"}</div>
      <div className="mb-4">
        <strong>Image Uploaded:</strong>{" "}
        {request.deviceImageUrl ? (
          <Image src={request.deviceImageUrl} alt="Device" className="max-w-xs" width={400} height={300} />
        ) : (
          "No image uploaded"
        )}
      </div>

      {/* Editable panel */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Edit Pickup Details</h2>
        <label className="block mb-2">
          Pickup Address:
          <input
            type="text"
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
            disabled={!isEditable}
            className="w-full p-2 border rounded mt-1"
          />
        </label>
        <label className="block mb-2">
          Pickup Date:
          <input
            type="date"
            value={editPickupDate}
            onChange={(e) => setEditPickupDate(e.target.value)}
            disabled={!isEditable}
            className="w-full p-2 border rounded mt-1"
          />
        </label>
        <label className="block mb-2">
          Pickup Time:
          <input
            type="time"
            value={editPickupTime}
            onChange={(e) => setEditPickupTime(e.target.value)}
            disabled={!isEditable}
            className="w-full p-2 border rounded mt-1"
          />
        </label>
        {saveError && <p className="text-red-600 mb-2">{saveError}</p>}
        {saveSuccess && <p className="text-green-600 mb-2">Changes saved successfully!</p>}
        <button
          onClick={handleSave}
          disabled={!isEditable || isSaving}
          className={`mt-2 px-4 py-2 rounded text-white ${
            isEditable && !isSaving ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="mb-4">
        <strong>Pickup Date:</strong> {request.pickupDate}</div>
      <div className="mb-4">
        <strong>Pickup Time:</strong> {request.pickupTime}</div>
      <div className="mb-4">
        <strong>Pickup Address:</strong> {request.address}</div>
      <div className="mb-4">
        <strong>Preferred Contact Number:</strong> {request.preferredContactNumber || "N/A"}</div>
      <div className="mb-4">
        <strong>Alternate Contact Number:</strong> {request.alternateContactNumber || "N/A"}</div>
      <div className="mb-4">
        <strong>Special Pickup Instructions:</strong> {request.specialInstructions || "None"}</div>
      <div className="mb-4">
        <strong>Declaration Checked:</strong> {request.declarationChecked ? "Yes" : "No"}</div>
      <div className="mb-4">
        <strong>Status:</strong> {request.status}</div>
      <div className="mb-4">
        <strong>Created At:</strong> {new Date(request.createdAt).toLocaleString()}</div>
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
