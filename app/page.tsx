import { cookies } from "next/headers";

import Link from "next/link";
import UserProfile from "./components/UserProfile/UserProfile";
import fetchSpotifyData, { SpotifyUserData } from "./utilFn/fetchSpotifyData";
import LogoutBtn from "./components/Utils/LogoutBtn/LogoutBtn";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotifyAccessToken")?.value;

  if (!accessToken) {
    return (
      <>
        <p>Please log in to access your Spotify data.</p>
        <Link href="/api/login">login to spotify</Link>
      </>
    );
  }

  const userData = await fetchSpotifyData<SpotifyUserData>(
    accessToken,
    "/v1/me"
  );

  if (!userData.data) {
    return (
      <div>
        <p>hi</p>
        <LogoutBtn />
      </div>
    );
  }

  // At this point, userData.data is guaranteed to be non-null
  return <UserProfile userData={{ data: userData.data }} />;
}
