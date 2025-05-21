import axios, { AxiosError } from "axios";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const artistName = url.searchParams.get("artistName");

  if (!artistName) {
    return new Response(JSON.stringify({ error: "artistName is required" }), {
      status: 400,
    });
  }

  try {
    // Step 1: First attempt to find the exact artist ID using Ticketmaster's attractions search
    const attractionResponse = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${
        process.env.TICKETMASTER_API_KEY
      }&keyword=${encodeURIComponent(artistName)}&classificationName=music`
    );

    let artistId;
    const attractions = attractionResponse.data?._embedded?.attractions || [];

    if (attractions.length > 0) {
      // Find exact match or closest match
      const exactMatch = attractions.find(
        (attr: { name: string }) =>
          attr.name.toLowerCase() === artistName.toLowerCase()
      );

      // Use exact match if found, otherwise use the first music artist
      const bestMatch =
        exactMatch ||
        attractions.find(
          (attr: {
            name: string;
            classifications: { segment: { name: string } }[];
          }) =>
            attr.classifications?.some(
              (c) => c.segment?.name?.toLowerCase() === "music"
            )
        );

      artistId = bestMatch?.id;
    }
    console.log(artistId);
    // Step 2: Query events with optimal parameters
    let eventsUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKETMASTER_API_KEY}&size=20`; // Get more results for filtering

    // If we found a specific artist ID, use it (most accurate)
    if (artistId) {
      eventsUrl += `&attractionId=${artistId}`;
    } else {
      // Otherwise, use more restrictive parameters to increase relevance
      eventsUrl += `&keyword=${encodeURIComponent(artistName)}`;
      eventsUrl += `&classificationName=music`; // Limit to music events
      eventsUrl += `&sort=relevance,desc`; // Sort by relevance first
    }

    const eventsResponse = await axios.get(eventsUrl);

    // Step 3: Apply additional post-filtering to ensure accuracy
    const events = eventsResponse.data?._embedded?.events || [];

    // Post-filtering to ensure we only have music events for this artist
    const filteredEvents = events.filter(
      (event: {
        name: string;
        classifications: { segment: { name: string } }[];
        _embedded: { attractions: { name: string }[] };
      }) => {
        // Verify it's a music event
        const isMusicEvent = event.classifications?.some(
          (c) => c.segment?.name?.toLowerCase() === "music"
        );

        // Check if the artist is actually performing
        // (not just mentioned in description)
        const hasArtistPerforming = event._embedded?.attractions?.some(
          (attraction) =>
            attraction.name.toLowerCase().includes(artistName.toLowerCase()) ||
            artistName.toLowerCase().includes(attraction.name.toLowerCase())
        );

        // Include if the event name directly contains artist name (common format)
        const eventNameHasArtist = event.name
          .toLowerCase()
          .includes(artistName.toLowerCase());

        return isMusicEvent && (hasArtistPerforming || eventNameHasArtist);
      }
    );

    // Limit to 8 results as originally specified
    const limitedResults = filteredEvents.slice(0, 8);

    // Construct a properly formatted response matching Ticketmaster's format
    const responseData = {
      _embedded: {
        events: limitedResults,
      },
      page: {
        size: limitedResults.length,
        totalElements: filteredEvents.length,
        totalPages: 1,
        number: 0,
      },
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    // Provide more specific error information when possible
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.errors
        ? error.response.data.errors[0]?.detail || "Failed to fetch events"
        : "Failed to fetch events";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: error.response?.status || 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    console.error("Error fetching events:", error);
  }
}
