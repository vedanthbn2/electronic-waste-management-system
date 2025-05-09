"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface PickupRequest {
  id: string;
  _id?: string;
  userId: string;
  fullName: string;
  phone: number;
  category: string;
  status: string;
  address: string;
  assignedReceiver?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  collectionNotes?: string;
  collectionProof?: string; // base64 image string
}

const PickupRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [images, setImages] = useState<{ [key: string]: string }>({});
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async () => {
      const userJSON = localStorage.getItem("user");
      const user = userJSON ? JSON.parse(userJSON) : null;
      if (!user) {
        router.push("/sign-in?message=signin to view pickup requests");
        return;
      }
      try {
        const response = await axios.get("/api/recycling-requests");
        // Filter requests assigned to this receiver
        const assignedRequests = response.data.filter(
          (req: any) =>
            req.assignedReceiver && req.assignedReceiver.id === user.id
        );
        setRequests(assignedRequests);
      } catch (error) {
        console.error("Error fetching pickup requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [router]);

  const handleNoteChange = (id: string, value: string) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => ({ ...prev, [id]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const submitCollectionProof = async (id: string) => {
    const note = notes[id] || "";
    const image = images[id] || "";

    if (!image) {
      alert("Please upload an image as collection proof.");
      return;
    }

    try {
      const updates = {
        status: "collected",
        collectionNotes: note,
        collectionProof: image,
      };

      // Use _id if available for PATCH request
      const requestToUpdate = requests.find((req) => req.id === id);
      const patchId = requestToUpdate?._id || id;

      const response = await fetch("/api/recycling-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: patchId, updates }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Collection proof submitted successfully.");
        // Refresh requests
        setRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, ...updates } : req
          )
        );
        // Clear notes and images for this request
        setNotes((prev) => {
          const newNotes = { ...prev };
          delete newNotes[id];
          return newNotes;
        });
        setImages((prev) => {
          const newImages = { ...prev };
          delete newImages[id];
          return newImages;
        });
        setSelectedRequest(null);
      } else {
        alert("Failed to submit collection proof: " + result.error);
      }
    } catch (error) {
      alert("Error submitting collection proof: " + error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading your pickup tasks...</div>;
  }

  if (requests.length === 0) {
    return <div className="p-8">No pickup tasks assigned to you.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Receiver Dashboard</h1>
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left">S.No</th>
            <th className="py-3 px-4 text-left">User Name</th>
            <th className="py-3 px-4 text-left">E-waste Type</th>
            <th className="py-3 px-4 text-left">Pickup Address</th>
            <th className="py-3 px-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {requests.map((req, index) => (
            <tr
              key={req.id}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedRequest(req)}
            >
              <td className="py-3 px-4">{index + 1}</td>
              <td className="py-3 px-4">{req.fullName}</td>
              <td className="py-3 px-4">{req.category}</td>
              <td className="py-3 px-4">{req.address}</td>
              <td className="py-3 px-4">{req.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={() => setSelectedRequest(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Pickup Request Details</h2>
            <div className="mb-2"><strong>User Name:</strong> {selectedRequest.fullName}</div>
            <div className="mb-2"><strong>Phone:</strong> {selectedRequest.phone}</div>
            <div className="mb-2"><strong>E-waste Type:</strong> {selectedRequest.category}</div>
            <div className="mb-2"><strong>Pickup Address:</strong> {selectedRequest.address}</div>
            <div className="mb-2"><strong>Status:</strong> {selectedRequest.status}</div>
            <div className="mb-2">
              <strong>Collection Notes:</strong>
              {selectedRequest.status === "collected" ? (
                <p>{selectedRequest.collectionNotes}</p>
              ) : (
                <textarea
                  value={notes[selectedRequest.id] || ""}
                  onChange={(e) => handleNoteChange(selectedRequest.id, e.target.value)}
                  className="border p-1 rounded w-full"
                  rows={3}
                />
              )}
            </div>
            <div className="mb-2">
              <strong>Collection Proof:</strong>
              {selectedRequest.status === "collected" && selectedRequest.collectionProof ? (
                <img
                  src={selectedRequest.collectionProof}
                  alt="Collection Proof"
                  className="max-w-xs max-h-48"
                />
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(selectedRequest.id, e)}
                  disabled={selectedRequest.status === "collected"}
                />
              )}
            </div>
            {selectedRequest.status !== "collected" && (
              <button
                onClick={() => submitCollectionProof(selectedRequest.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                E Waste Received
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupRequestsPage;
