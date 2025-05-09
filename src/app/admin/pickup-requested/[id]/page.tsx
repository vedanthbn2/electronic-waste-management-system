"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface Receiver {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface RecyclingRequestDetail {
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
  deviceImageUrl?: string;
  category?: string;
  model?: string;
  collectionNotes?: string;
  collectionProof?: string;
  receivedBy?: string;
  assignedReceiver?: Receiver;
}

const PickupRequestDetailPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<RecyclingRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [selectedReceiverId, setSelectedReceiverId] = useState<string>("");

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await axios.get("/api/recycling-requests");
        const found = response.data.find((req: any) => (req._id || req.id) === id);
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
            location: found.location,
            deviceCondition: found.deviceCondition,
            accessories: found.accessories,
            preferredContactNumber: found.preferredContactNumber,
            alternateContactNumber: found.alternateContactNumber,
            specialInstructions: found.specialInstructions,
            declarationChecked: found.declarationChecked,
            status: found.status || "pending",
            createdAt: found.createdAt || new Date().toISOString(),
            deviceImageUrl: found.deviceImageUrl || null,
            category: found.category || "",
            model: found.model || "",
            collectionNotes: found.collectionNotes || "",
            collectionProof: found.collectionProof || "",
            receivedBy: found.receivedBy || "",
            assignedReceiver: found.assignedReceiver || null,
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

    const fetchReceivers = async () => {
      try {
        const response = await axios.get("/api/receivers");
        if (response.data.success) {
          setReceivers(response.data.data);
        } else {
          setReceivers([]);
        }
      } catch (error) {
        console.error("Error fetching receivers:", error);
        setReceivers([]);
      }
    };

    fetchRequest();
    fetchReceivers();
  }, [id]);

  const approvePickup = async () => {
    if (!selectedReceiverId) {
      alert("Please select a receiver before approving.");
      return;
    }

    try {
      const assignedReceiver = receivers.find(r => r.id === selectedReceiverId);
      if (!assignedReceiver) {
        alert("Selected receiver not found.");
        return;
      }

      const updates = {
        status: "approved",
        assignedReceiver: {
          id: assignedReceiver.id,
          name: assignedReceiver.name,
          email: assignedReceiver.email,
          phone: assignedReceiver.phone,
        },
      };

      const response = await fetch("/api/recycling-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: request?.id, updates }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Pickup request approved and assigned to receiver: " + assignedReceiver.name);
        window.location.reload();
      } else {
        alert("Failed to approve pickup: " + result.error);
      }
    } catch (error) {
      alert("Error approving pickup: " + error);
    }
  };

  const markReceivedByRecycler = async () => {
    if (!request) return;

    try {
      const updates = {
        receivedBy: "Recycler",
        status: "received_by_recycler",
      };

      const response = await fetch("/api/recycling-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: request.id, updates }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Marked as received by recycler.");
        window.location.reload();
      } else {
        alert("Failed to mark as received: " + result.error);
      }
    } catch (error) {
      alert("Error marking as received: " + error);
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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Pickup Request Details</h1>
      <div className="mb-4">
        <strong>User ID:</strong> {request.userId}
      </div>
      <div className="mb-4">
        <strong>Name:</strong> {request.fullName}
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
        <strong>Device Condition:</strong> {request.deviceCondition}
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
        <strong>Preferred Contact Number:</strong> {request.preferredContactNumber}
      </div>
      <div className="mb-4">
        <strong>Alternate Contact Number:</strong> {request.alternateContactNumber || "N/A"}</div>
      <div className="mb-4">
        <strong>Special Pickup Instructions:</strong> {request.specialInstructions || "None"}
      </div>
      <div className="mb-4">
        <strong>Declaration Checked:</strong> {request.declarationChecked ? "Yes" : "No"}
      </div>
      <div className="mb-4">
        <strong>Status:</strong> {request.status}
      </div>
      <div className="mb-4">
        <strong>Collection Notes:</strong> {request.collectionNotes || "None"}
      </div>
      <div className="mb-4">
        <strong>Collection Proof:</strong>{" "}
        {request.collectionProof ? (
          <img src={request.collectionProof} alt="Collection Proof" className="max-w-xs max-h-48" />
        ) : (
          "No proof uploaded"
        )}
      </div>
      <div className="mb-4">
        <strong>Received By:</strong> {request.receivedBy || "Not received yet"}
      </div>

      {request.assignedReceiver ? (
        <div className="mb-4">
          <strong>Assigned Receiver:</strong> {request.assignedReceiver.name}
        </div>
      ) : (
        <div className="mb-4">
          <label htmlFor="receiverSelect" className="block mb-2 font-semibold">
            Select Receiver to Assign:
          </label>
          <select
            id="receiverSelect"
            value={selectedReceiverId}
            onChange={(e) => setSelectedReceiverId(e.target.value)}
            className="border p-2 rounded w-full max-w-xs"
          >
            <option value="">-- Select Receiver --</option>
            {receivers.map((receiver) => (
              <option key={receiver.id} value={receiver.id}>
                {receiver.name} ({receiver.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        className="bg-green-600 text-white py-2 px-4 rounded mr-4"
        onClick={approvePickup}
        disabled={!!request.assignedReceiver}
      >
        Approve Pickup
      </button>

      {request.status === "collected" && request.receivedBy !== "Recycler" && (
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded"
          onClick={markReceivedByRecycler}
        >
          Received by Recycler
        </button>
      )}

      <button
        className="bg-gray-600 text-white py-2 px-4 rounded ml-4"
        onClick={() => router.back()}
      >
        Back to Pickup Requests
      </button>
    </div>
  );
};

export default PickupRequestDetailPage;
