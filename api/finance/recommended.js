import yahooFinance from "yahoo-finance2";

export default async function (req, res) {
  if (req.method === "GET") {
    try {
      const stockSymbols = req.query.stockSymbols;
      console.log("this is stock symbols " + stockSymbols);
      const result = await yahooFinance.recommendationsBySymbol(stockSymbols);
      res.json(result);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  } else {
    // If the request method is not GET, return a 405 Method Not Allowed.
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
