import Header from "../Utils/Header/Header";
import Logo from "../Utils/Logo/Logo";
import { SpotifyUserDataResponse } from "@/app/utilFn/fetchSpotifyData";
import Image from "next/image";
type userProfileProps = {
  userData: SpotifyUserDataResponse;
};

export default function UserProfile({ userData }: userProfileProps) {
  const data = {
    display_name: userData.display_name,
    followers: +userData.followers.total,
    imageURL: userData.images?.[0]?.url,
  };

  return (
    <div>
      <Header>
        <Logo />
      </Header>
      <h1>Welcome, {data.display_name}</h1>
      <p>Followers {data.followers}</p>
      {data.imageURL && (
        <Image
          src={data.imageURL}
          width={50}
          height={50}
          alt="User profile picture"
        />
      )}
    </div>
  );
}
