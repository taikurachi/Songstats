"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SpotifyGrid from "@/app/components/utils/SpotifyGrid";
import Header from "@/app/components/utils/Header";
import Sidebar from "@/app/components/utils/Sidebar";

export default function SearchPage({ params }) {
  console.log(params.query);

  return (
    <SpotifyGrid>
      <Sidebar />
      <Header />
      <div>subpage</div>
    </SpotifyGrid>
  );
}
