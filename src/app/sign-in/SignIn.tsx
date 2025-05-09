"use client";

import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { 
  setUser,
  setfullname,
  setToken,
  setUserID,
  setEmail, 
  setPhoneNumber
} from "./auth";
import { useSearchParams } from "next/navigation";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const login = async () => {
    toast.loading("Authenticating...");
    
    try {
      if (!formData.email || !formData.password) {
        throw new Error("Please enter email and password");
      }

      // Check admin credentials
      if (formData.email === "admin@local.com" && formData.password === "admin123") {
        const mockUser = {
          email: formData.email,
          token: "mock-token-" + Date.now(),
          role: "admin",
          id: "admin-1",
          fullname: "Admin User",
          phoneNumber: "1234567890",
          username: formData.email
        };
        toast.success("Admin login successful!");
        localStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);
        setToken(mockUser.token);
        setUserID(mockUser.id);
        setEmail(mockUser.email);
        setfullname(mockUser.fullname);
        setPhoneNumber(mockUser.phoneNumber);
        window.location.href = "/admin";
        return;
      }

      // Check receiver credentials
      const responseReceivers = await fetch('/api/receivers');
      const resultReceivers = await responseReceivers.json();
      if (!resultReceivers.success) {
        throw new Error("Failed to fetch receivers");
      }
      const receivers = resultReceivers.data;
      const matchedReceiver = receivers.find(
        (r: { email: string; password: string }) =>
          r.email === formData.email && r.password === formData.password
      );
      if (matchedReceiver) {
        const mockUser = {
          email: matchedReceiver.email,
          token: "mock-token-" + Date.now(),
          role: "receiver",
          id: matchedReceiver.id,
          fullname: matchedReceiver.name,
          phoneNumber: matchedReceiver.phone,
          username: matchedReceiver.email
        };
        toast.success("Receiver login successful!");
        localStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);
        setToken(mockUser.token);
        setUserID(mockUser.id);
        setEmail(mockUser.email);
        setfullname(mockUser.fullname);
        setPhoneNumber(mockUser.phoneNumber);
        window.location.href = "/pickup-requests"; // Redirect to receiver dashboard
        return;
      }

      // Assume user role - authenticate via local API
      const userResponse = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const userResult = await userResponse.json();
      if (userResponse.ok && userResult.success) {
        const userData = userResult.data;
        const mockUser = {
          email: userData.email,
          token: userData.token || "mock-token-" + Date.now(),
          role: "user",
          id: userData.id || "user-" + Date.now(),
          fullname: userData.fullName || "Regular User",
          phoneNumber: userData.phoneNumber || "1234567890",
          username: userData.email
        };
        toast.success("User login successful!");
        localStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);
        setToken(mockUser.token);
        setUserID(mockUser.id);
        setEmail(mockUser.email);
        setfullname(mockUser.fullname);
        setPhoneNumber(mockUser.phoneNumber);
        window.location.href = "/";
        return;
      } else {
        throw new Error(userResult.message || "Invalid user credentials");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-center md:h-screen h-[70vh]">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
        <div className="flex flex-col justify-center p-8 md:p-14 w-96">
          <span className="mb-3 text-4xl font-bold">Welcome back</span>
          {message && (
            <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded border border-yellow-300">
              {message}
            </div>
          )}
          <div className="space-y-4">
            <div className="py-4">
              <span className="mb-2 text-md">Email</span>
              <input
                type="text"
                className="w-full p-2 sign-field rounded-md"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
              />
            </div>
            <div className="py-4">
              <span className="mb-2 text-md">Password</span>
              <input
                type="password"
                className="w-full p-2 sign-field rounded-md"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
              />
            </div>
            <button
              className="w-full bg-black mt-4 text-white p-2 rounded-lg hover:bg-emerald-400"
              onClick={login}
            >
              Sign In
            </button>
            <div className="mt-4 text-center">
              <a href="/sign-up" className="text-blue-600 hover:underline">
                Don't have an account? Sign Up
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
