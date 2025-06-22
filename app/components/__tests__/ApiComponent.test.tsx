import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";

// Example component that makes API calls
const LyricsScoreComponent = () => {
  const [lyrics, setLyrics] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/lyrics-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lyrics }),
      });

      if (!response.ok) throw new Error("Failed to fetch score");

      const data = await response.json();
      setScore(data.score);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        placeholder="Enter lyrics..."
        data-testid="lyrics-input"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        data-testid="submit-btn"
      >
        {loading ? "Loading..." : "Get Score"}
      </button>
      {error && <div data-testid="error">{error}</div>}
      {score !== null && <div data-testid="score">Score: {score}</div>}
    </div>
  );
};

// Mock fetch globally
global.fetch = jest.fn();
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("LyricsScoreComponent", () => {
  beforeEach(() => {
    mockedFetch.mockClear();
  });

  it("should display score on successful API call", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ score: 85 }),
    } as Response);

    render(<LyricsScoreComponent />);

    const input = screen.getByTestId("lyrics-input");
    const button = screen.getByTestId("submit-btn");

    fireEvent.change(input, { target: { value: "test lyrics" } });
    fireEvent.click(button);

    // Check loading state
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Wait for API call to complete
    await waitFor(() => {
      expect(screen.getByTestId("score")).toHaveTextContent("Score: 85");
    });

    expect(mockedFetch).toHaveBeenCalledWith("/api/lyrics-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lyrics: "test lyrics" }),
    });
  });

  it("should display error on failed API call", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as Response);

    render(<LyricsScoreComponent />);

    const input = screen.getByTestId("lyrics-input");
    const button = screen.getByTestId("submit-btn");

    fireEvent.change(input, { target: { value: "test lyrics" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Failed to fetch score"
      );
    });
  });

  it("should handle network errors", async () => {
    mockedFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<LyricsScoreComponent />);

    const button = screen.getByTestId("submit-btn");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Network error");
    });
  });
});
