export const fetchLyrics = async (isrc: string) => {
  try {
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? `https://${process.env.VERCEL_URL}` // Use the Vercel URL in production
        : "http://localhost:3000"; // Use localhost URL during development

    const url = `${baseUrl}/api/lyrics?isrc=${isrc}`;
    console.log("fetching lyrics now...");
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data?.message?.body?.lyrics?.lyrics_body || "";
  } catch (err) {
    console.error(err);
    return "";
  }
};
