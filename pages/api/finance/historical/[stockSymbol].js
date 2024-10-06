import yahooFinance from "yahoo-finance2";

export default async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "GET") {
    const { stockSymbol } = req.query;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const queryOptions = {
      period1: oneYearAgo.toISOString().split("T")[0], // Format: YYYY-MM-DD
    };
    console.log("requesting historical data for", stockSymbol);

    try {
      const result = await yahooFinance.historical(stockSymbol, queryOptions);
      res.json(result);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      res.status(500).json({ error: "Failed to fetch historical data" });
    }
  } else {
    // If the request method is not GET, return a 405 Method Not Allowed.
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
