import yahooFinance from "yahoo-finance2";

export default async function (req, res) {
  if (req.method === "GET") {
    try {
      const queryOptions = { count: 5, lang: "en-US" };
      const result = await yahooFinance.trendingSymbols("CA", queryOptions);
      res.json(result);
    } catch (error) {
      console.error("Error fetching trending symbols:", error);
      res.status(500).json({ error: "Failed to fetch trending symbols" });
    }
  } else {
    // If the request method is not GET, return a 405 Method Not Allowed.
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
