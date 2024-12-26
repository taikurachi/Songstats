import Header from "../Utils/Header/Header";
import Logo from "../Utils/Logo/Logo";
import { SpotifyUserData } from "@/app/utilFn/fetchSpotifyData";
import Image from "next/image";
type userProfileProps = {
  userData: {
    data: SpotifyUserData;
  };
};

export default function UserProfile({ userData }: userProfileProps) {
  console.log(userData);
  const data = {
    display_name: userData.data.display_name,
    followers: +userData.data.followers.total,
    imageURL: userData.data.images?.[0]?.url,
  };
  console.log(data);
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
