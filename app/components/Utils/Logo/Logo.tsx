import Image from "next/image";
export default function Logo() {
  return (
    <Image
      src={"/spotifyLogo.svg"}
      alt="Spotify Logo Image"
      width={100}
      height={30}
    />
  );
}
