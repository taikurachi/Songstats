import RelatedMedia from "@/app/components/related-media";
import { cookies } from "next/headers";

export default async function RelatedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const dominantColor = cookieStore.get(`bg_color_${id}`)?.value || "";

  return (
    <div className="row-start-2 col-start-2 rounded-xl font-bold text-2xl overflow-y-scroll flex h-full gap-2">
      <RelatedMedia dominantColor={dominantColor} />
    </div>
  );
}
