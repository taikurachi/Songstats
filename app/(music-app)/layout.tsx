import { ReactNode } from "react";
import Header from "../components/utils/Header";
import Sidebar from "../components/utils/Sidebar";
import SpotifyGrid from "../components/utils/SpotifyGrid";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SpotifyGrid>
      <Header />
      <Sidebar />

      {children}
    </SpotifyGrid>
  );
}
