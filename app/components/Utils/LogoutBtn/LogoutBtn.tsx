"use client";

import { useRouter } from "next/navigation";

export default function LogoutBtn() {
  const router = useRouter();
  const handleClick = async () => {
    try {
      const response = await fetch("/api/logout", { method: "GET" });
      if (response.ok) {
        router.push("/"); // Redirect to home or login page
      } else {
        console.error("Failed to log out:", await response.json());
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return <button onClick={handleClick}>logout</button>;
}
