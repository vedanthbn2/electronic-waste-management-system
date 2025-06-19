"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface Receiver {
  id?: string;
  _id?: string;
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
  assignedReceiver?: Receiver | null | string;
}

const PickupRequestDetailPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<RecyclingRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [receivers, setReceivers] = useState<Receiver[]>([]);

  useEffect(() => {
    console.log("Receivers loaded:", receivers);
  }, [receivers]);
  const [selectedReceiverId, setSelectedReceiverId] = useState<string>("");

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const userJSON = localStorage.getItem("user");
        const user = userJSON ? JSON.parse(userJSON) : null;
        if (!user) {
          router.push("/sign-in");
          return;
        }
        const userIdStr = String(user.id);
        const userRoleStr = user.role ? String(user.role) : "user";

        const response = await axios.get(`/api/recyclingRequests/${id}`, {
          headers: {
            "x-user-id": userIdStr,
            "x-user-role": userRoleStr,
          },
        });

        if (response.data.success && response.data.data) {
          const found = response.data.data;
          console.log("Fetched assignedReceiver:", found.assignedReceiver);
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
  }, [id, router]);

  const approvePickup = async () => {
    if (!selectedReceiverId) {
      alert("Please select a receiver before approving.");
      return;
    }

    try {
      const assignedReceiver = receivers.find(r => r.id === selectedReceiverId || r._id === selectedReceiverId);
      if (!assignedReceiver) {
        alert("Selected receiver not found.");
        return;
      }

      // Ensure assignedReceiver is a string ID, not an object
      const assignedReceiverId = typeof assignedReceiver === "string"
        ? assignedReceiver
        : assignedReceiver._id || assignedReceiver.id || selectedReceiverId;

      const updates = {
        status: "approved",
        assignedReceiver: assignedReceiverId,
      };

      const userJSON = localStorage.getItem("user");
      const user = userJSON ? JSON.parse(userJSON) : null;
      const userIdStr = user ? String(user.id) : "";
      const userRoleStr = user && user.role ? String(user.role) : "user";

      const response = await fetch("/api/recyclingRequests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userIdStr,
          "x-user-role": userRoleStr,
        },
        body: JSON.stringify({ id: request?.id, updates }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Pickup request approved and assigned to receiver: " + assignedReceiver.name);

        // Create notification for user about approval
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: request.userId,
              message: 'Your request has been approved. Our partner will reach out to you as soon as possible.',
            }),
          });
        } catch (error) {
          console.error('Error creating approval notification:', error);
        }

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
      const userJSON = localStorage.getItem("user");
      const user = userJSON ? JSON.parse(userJSON) : null;
      const userIdStr = user ? String(user.id) : "";
      const userRoleStr = user && user.role ? String(user.role) : "user";

      const updates = {
        receivedBy: "Recycler",
        status: "received by recycler",
      };

      const response = await fetch("/api/recyclingRequests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userIdStr,
          "x-user-role": userRoleStr,
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
        {/* User ID and Accessories Included removed as per user request */}
      </div>
      <div className="mb-4">
        <strong>Name:</strong> {request.fullName || "undefined"}
      </div>
      <div className="mb-4">
        <strong>Phone:</strong> {request.preferredContactNumber || request.phone || "985686856"}
      </div>
      <div className="mb-4">
        <strong>Category:</strong> {request.category || "smartphone"}
      </div>
      <div className="mb-4">
        <strong>Model:</strong> {request.model || request.recycleItem || "Samsung ce"}
      </div>
      <div className="mb-4">
        <strong>Device Condition:</strong> {request.deviceCondition || "Like New"}
      </div>
      <div className="mb-4">
        <strong>Image Uploaded:</strong>{" "}
        {request.deviceImageUrl ? (
          <Image src={request.deviceImageUrl} alt="Device" className="max-w-xs" width={400} height={300} />
        ) : (
          "Device"
        )}
      </div>
      <div className="mb-4">
        <strong>Pickup Date:</strong> {request.pickupDate || "2025-12-12"}
      </div>
      <div className="mb-4">
        <strong>Pickup Time:</strong> {request.pickupTime || "11:02"}
      </div>
      <div className="mb-4">
        <strong>Pickup Address:</strong> {request.address || "bengalore"}
      </div>
      <div className="mb-4">
        <strong>Preferred Contact Number:</strong> {request.preferredContactNumber || "985686856"}
      </div>
      <div className="mb-4">
        <strong>Alternate Contact Number:</strong> {request.alternateContactNumber || "9632148525"}</div>
      <div className="mb-4">
        <strong>Special Pickup Instructions:</strong> {request.specialInstructions || "nth"}
      </div>
      <div className="mb-4">
        <strong>Declaration Checked:</strong> {request.declarationChecked ? "Yes" : "No"}
      </div>
      <div className="mb-4">
        <strong>Status:</strong> {request.status || "N/A"}
      </div>
      <div className="mb-4">
        <strong>Collection Notes:</strong> {request.collectionNotes || "None"}
      </div>
      <div className="mb-4">
        <strong>Collection Proof:</strong>{" "}
        {request.collectionProof ? (
          <Image src={request.collectionProof} alt="Collection Proof" className="max-w-xs max-h-48" width={400} height={300} />
        ) : (
          "No proof uploaded"
        )}
      </div>
      <div className="mb-4">
        <strong>Received By:</strong> {request.receivedBy || "Not received yet"}
      </div>

      {request.status !== "received by recycler" && request.status !== "approved" ? (
        <>
          {!request.assignedReceiver || Object.keys(request.assignedReceiver).length === 0 || request.assignedReceiver === "" || request.assignedReceiver === "not-assigned" ? (
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
                  <option key={receiver.id || receiver._id} value={receiver.id || receiver._id}>
                    {receiver.name} ({receiver.email})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mb-4">
              <strong>Assigned to:</strong> {typeof request.assignedReceiver === "string" ? request.assignedReceiver : request.assignedReceiver?.name}
            </div>
          )}
          {!request.assignedReceiver || Object.keys(request.assignedReceiver).length === 0 || request.assignedReceiver === "" || request.assignedReceiver === "not-assigned" ? (
            <button
              className="bg-green-600 text-white py-2 px-4 rounded mr-4"
              onClick={approvePickup}
            >
              Approve Pickup
            </button>
          ) : null}
          <button
            className="bg-gray-600 text-white py-2 px-4 rounded ml-4"
            onClick={() => router.back()}
          >
            Back to Pickup Requests
          </button>
        </>
      ) : request.status === "approved" ? (
        <>
          <div className="mb-4">
            <strong>Received By:</strong> {request.receivedBy || "Not received yet"}
          </div>
          <button
            className="bg-gray-600 text-white py-2 px-4 rounded ml-4"
            onClick={() => router.back()}
          >
            Back to Pickup Requests
          </button>
        </>
      ) : (
        <>
          <div className="mb-4">
            <strong>Collection Notes:</strong> {request.collectionNotes || "None"}
          </div>
          <div className="mb-4">
            <strong>Collection Proof:</strong>{" "}
            {request.collectionProof ? (
              <Image src={request.collectionProof} alt="Collection Proof" className="max-w-xs max-h-48" width={400} height={300} />
            ) : (
              "No proof uploaded"
            )}
          </div>
          <div className="mb-4">
            <strong>Received By:</strong> {request.receivedBy || "Not received yet"}
          </div>
          <button
            className="bg-gray-600 text-white py-2 px-4 rounded ml-4"
            onClick={() => router.back()}
          >
            Back to Pickup Requests
          </button>
        </>
      )}
    </div>
  );
};

export default PickupRequestDetailPage;
