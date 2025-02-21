// export async function generateMetadata({ params }: { params: { id: string } }) {
//   const song = await getSongData(params.id);
//   return {
//     title: song.name,
//   };
// }
import SongPage from "@/app/components/songPage/SongPage";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;

  return <SongPage id={id} />;
}
