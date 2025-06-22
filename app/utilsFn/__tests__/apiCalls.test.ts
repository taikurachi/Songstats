// Example utility function to test
const fetchLyricsScore = async (lyrics: string) => {
  const response = await fetch("/api/lyrics-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lyrics }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

// Mock fetch globally
global.fetch = jest.fn();
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("Client-Side API Calls", () => {
  beforeEach(() => {
    mockedFetch.mockClear();
  });

  describe("fetchLyricsScore", () => {
    it("should fetch lyrics score successfully", async () => {
      const mockResponse = { score: 85 };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchLyricsScore("test lyrics");

      expect(result).toEqual(mockResponse);
      expect(mockedFetch).toHaveBeenCalledWith("/api/lyrics-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lyrics: "test lyrics" }),
      });
    });

    it("should throw error for failed requests", async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      } as Response);

      await expect(fetchLyricsScore("test lyrics")).rejects.toThrow(
        "API Error: 400"
      );
    });

    it("should handle network errors", async () => {
      mockedFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(fetchLyricsScore("test lyrics")).rejects.toThrow(
        "Network error"
      );
    });
  });
});
