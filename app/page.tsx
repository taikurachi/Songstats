import { cookies } from "next/headers";
import Link from "next/link";
import UserProfile from "./components/UserProfile/UserProfile";
import fetchSpotifyData, {
  SpotifyTopArtistsResponse,
  SpotifyUserDataResponse,
} from "./utilFn/fetchSpotifyData";
import LogoutBtn from "./components/Utils/LogoutBtn/LogoutBtn";
import Artists from "./components/UserProfile/Artists/Artists";

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

  const userData = await fetchSpotifyData<SpotifyUserDataResponse>(
    accessToken,
    "/v1/me"
  );

  const topArtists = await fetchSpotifyData<SpotifyTopArtistsResponse>(
    accessToken,
    "/v1/me/top/artists"
  );

  if (!userData.data) {
    return (
      <div>
        <p>hi</p>
        <LogoutBtn />
      </div>
    );
  }
  if (!topArtists.data) {
    return <p>there are no are artists</p>;
  }

  return (
    <>
      <UserProfile userData={userData.data} />;
      <Artists topArtists={topArtists.data.items} />
    </>
  );
}
