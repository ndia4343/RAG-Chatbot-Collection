export const fetchBotResponse = async (query: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch response");
  }

  return response.json();
};
