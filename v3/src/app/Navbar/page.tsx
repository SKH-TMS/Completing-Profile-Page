"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Get current route

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/token", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      setIsAuthenticated(data.success);
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth(); // Run authentication check when the component mounts
  }, []);

  useEffect(() => {
    checkAuth(); // Run authentication check on route change
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(false);
        router.push("/Login");
      } else {
        console.error("Logout failed:", data.message);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-blue-900 flex justify-between ">
      <div>
        <Link href="/" className="text-white">
          Home
        </Link>
      </div>
      <div>
        {!isAuthenticated ? (
          <>
            <Link href="/Login" className="text-white mx-2">
              Login
            </Link>
            <Link href="/Register" className="text-white">
              Register
            </Link>
          </>
        ) : (
          <>
            <Link href="/Profile" className="text-white mx-2">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-white cursor-pointer bg-red-500 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
