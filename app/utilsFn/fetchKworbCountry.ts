import axios from "axios";

export type KworbCountryData = {
  success: boolean;
  topStreamsByCountry: string | null;
  topStreamCount?: number;
  trackId?: string;
  allCountries?: Array<{
    country: string;
    streams: number;
    raw_country: string;
    raw_streams: string;
  }>;
  error?: string;
};

export const fetchKworbCountry = async (
  trackId: string
): Promise<KworbCountryData> => {
  try {
    if (!trackId) {
      console.error("No trackId provided to fetchKworbCountry");
      return {
        success: false,
        topStreamsByCountry: null,
        error: "No trackId provided",
      };
    }

    console.log("Fetching kworb data for trackId:", trackId);
    const response = await axios.post("/api/kworb-country", {
      trackId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching kworb country data:", error);
    return {
      success: false,
      topStreamsByCountry: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
