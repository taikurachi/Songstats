"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SpotifyGrid from "../components/utils/SpotifyGrid";
import Sidebar from "../components/utils/Sidebar";
import Header from "../components/utils/Header";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Use useEffect to update the URL when searchQuery changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        router.push(`/search/${encodeURIComponent(searchQuery)}`, {
          scroll: false,
        });
      } else if (searchQuery === "") {
        router.push("/search");
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, router]);

  return (
    <SpotifyGrid>
      <Sidebar />
      <Header />
      <div>hello</div>
    </SpotifyGrid>
  );
}
