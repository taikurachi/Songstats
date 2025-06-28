import Lyrics from "../../../../components/lyrics";
import { cookies } from "next/headers";

export default async function LyricsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const dominantColor = cookieStore.get(`bg_color_${id}`)?.value || "";

  return (
    <div className="row-start-2 col-start-2 rounded-xl font-bold text-2xl flex h-full overflow-hidden gap-2">
      <Lyrics dominantColor={dominantColor} />
    </div>
  );
}
