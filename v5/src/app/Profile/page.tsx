"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Profile() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profilePic: "/default-profile.png",
    contact: "",
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        console.log("User data:", data);

        if (data.success) {
          setIsAuthenticated(true);
          setUser({
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            email: data.user.email,
            profilePic: data.user.profilePic
              ? `${data.user.profilePic}?t=${new Date().getTime()}`
              : "/default-profile.png",
            contact: data.user.contact || "",
          });
        } else {
          setIsAuthenticated(false);
          setErrorMessage(data.message || "Invalid token");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorMessage("Failed to fetch user data. Please try again later.");
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/Login");
    }
  }, [isAuthenticated, loading, router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("profilePic", selectedFile);
    formData.append("email", user.email);

    try {
      const response = await fetch("/api/upload/update-profile-pic", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        // Force browser to fetch new image by appending timestamp
        const updatedProfilePic = `${
          data.profilePicUrl
        }?t=${new Date().getTime()}`;

        setUser((prevUser) => ({
          ...prevUser,
          profilePic: updatedProfilePic,
        }));
      } else {
        console.error("Upload failed:", data.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (errorMessage) {
    return (
      <div>
        <h2>Error: {errorMessage}</h2>
        <p>Please log in again.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h2>No user credentials found</h2>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="mt-4 p-4 border rounded-lg shadow-md w-80 text-center">
        <Image
          src={user.profilePic}
          alt="Profile Picture"
          width={100}
          height={100}
          className="rounded-full mx-auto"
        />
        <h2 className="mt-4 text-lg font-semibold">
          {user.firstName} {user.lastName}
        </h2>
        <p className="text-gray-600">{user.email}</p>
        {user.contact && (
          <p className="text-gray-500">Contact: {user.contact}</p>
        )}
        <input type="file" onChange={handleFileChange} className="mt-4" />
        <button
          onClick={handleUpload}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Change Profile Picture
        </button>
      </div>
    </div>
  );
}
