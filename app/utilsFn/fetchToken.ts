const fetchToken = async () => {
  try {
    const response = await fetch("/api/token");
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};

export default fetchToken;
